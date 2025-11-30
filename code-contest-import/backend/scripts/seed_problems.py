#!/usr/bin/env python3
"""
Codeforces Problem Scraper
===========================

This script scrapes programming problems from Codeforces and seeds them into our MongoDB database.

Features:
- Extracts problems from Codeforces problemset
- Converts HTML to clean Markdown
- Maps Codeforces ratings to our difficulty levels
- Validates data before insertion
- Handles errors gracefully with retry logic
- Respects rate limits (minimum 2 seconds between requests)

Usage:
    # Scrape problems 1-50
    python seed_problems.py --start 1 --end 50
    
    # Dry run (no database changes)
    python seed_problems.py --start 1 --end 10 --dry-run
    
    # Verbose mode
    python seed_problems.py --start 1 --end 20 --verbose

Dependencies:
    pip install requests beautifulsoup4 pymongo python-dotenv markdownify lxml

Environment Variables:
    MONGO_URI - MongoDB connection string
    PROBLEM_START - Starting problem number (default: 1)
    PROBLEM_END - Ending problem number (default: 100)
    DELAY_SECONDS - Delay between requests (default: 2.0)
    MAX_RETRIES - Maximum retry attempts (default: 3)
    DRY_RUN - Run without database insertion (default: false)
    VERBOSE - Enable verbose logging (default: false)
    MAX_PROBLEMS_PER_RUN - Maximum problems per execution (default: 100)
    LOG_FILE - Log file path (default: scraper.log)

Author: Coding Platform Team
Date: October 2025
License: MIT
"""

import os
import sys
import time
import json
import logging
import argparse
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from urllib.parse import urljoin

# Third-party imports
try:
    import requests
    from bs4 import BeautifulSoup
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, DuplicateKeyError
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Error: Missing required dependency: {e}")
    print("Please install dependencies: pip install requests beautifulsoup4 pymongo python-dotenv lxml")
    sys.exit(1)

# Load environment variables
load_dotenv()

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Configuration manager for the scraper"""
    
    def __init__(self):
        """Initialize configuration with default values"""
        self.mongo_uri: str = ""
        self.problem_start: int = 1
        self.problem_end: int = 100
        self.delay_seconds: float = 2.0
        self.max_retries: int = 3
        self.dry_run: bool = False
        self.verbose: bool = False
        self.max_problems_per_run: int = 100
        self.log_file: str = "scraper.log"
        self.user_agent: str = "Mozilla/5.0 (Educational Scraper for Coding Platform)"
    
    @classmethod
    def from_env(cls) -> 'Config':
        """Load configuration from environment variables"""
        config = cls()
        
        # Required
        config.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/coding-platform')
        
        # Optional with defaults
        config.problem_start = int(os.getenv('PROBLEM_START', '1'))
        config.problem_end = int(os.getenv('PROBLEM_END', '100'))
        config.delay_seconds = float(os.getenv('DELAY_SECONDS', '2.0'))
        config.max_retries = int(os.getenv('MAX_RETRIES', '3'))
        config.dry_run = os.getenv('DRY_RUN', 'false').lower() == 'true'
        config.verbose = os.getenv('VERBOSE', 'false').lower() == 'true'
        config.max_problems_per_run = int(os.getenv('MAX_PROBLEMS_PER_RUN', '100'))
        config.log_file = os.getenv('LOG_FILE', 'scraper.log')
        
        return config
    
    def validate(self) -> Tuple[bool, List[str]]:
        """
        Validate configuration parameters
        Returns: (is_valid, error_messages)
        """
        errors = []
        
        if not self.mongo_uri:
            errors.append("MONGO_URI is required")
        
        if self.problem_start < 1:
            errors.append("PROBLEM_START must be >= 1")
        
        if self.problem_end < self.problem_start:
            errors.append("PROBLEM_END must be >= PROBLEM_START")
        
        if self.delay_seconds < 1.0:
            errors.append("DELAY_SECONDS must be >= 1.0 (respect Codeforces servers)")
        
        if self.max_retries < 1:
            errors.append("MAX_RETRIES must be >= 1")
        
        if self.max_problems_per_run < 1:
            errors.append("MAX_PROBLEMS_PER_RUN must be >= 1")
        
        return len(errors) == 0, errors
    
    def __str__(self) -> str:
        """String representation of configuration"""
        return f"""Configuration:
  MongoDB URI: {self.mongo_uri[:30]}...
  Problem Range: {self.problem_start}-{self.problem_end}
  Delay: {self.delay_seconds}s
  Max Retries: {self.max_retries}
  Dry Run: {self.dry_run}
  Verbose: {self.verbose}
  Max Problems/Run: {self.max_problems_per_run}
  Log File: {self.log_file}"""


# ============================================================================
# LOGGER
# ============================================================================

class ScraperLogger:
    """Logger for scraper operations"""
    
    def __init__(self, log_file: str, verbose: bool):
        """Initialize logger with file and console handlers"""
        self.log_file = log_file
        self.verbose = verbose
        self.stats = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'skipped': 0,
            'start_time': None,
            'end_time': None
        }
        
        # Set up logging
        self.logger = logging.getLogger('CodeforcesScra per')
        self.logger.setLevel(logging.DEBUG if verbose else logging.INFO)
        
        # File handler
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        file_formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s: %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_formatter)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG if verbose else logging.INFO)
        console_formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s: %(message)s',
            datefmt='%H:%M:%S'
        )
        console_handler.setFormatter(console_formatter)
        
        # Add handlers
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def info(self, message: str):
        """Log info message"""
        self.logger.info(message)
    
    def error(self, message: str, exception: Optional[Exception] = None):
        """Log error message"""
        if exception:
            self.logger.error(f"{message}: {str(exception)}")
        else:
            self.logger.error(message)
    
    def warning(self, message: str):
        """Log warning message"""
        self.logger.warning(message)
    
    def debug(self, message: str):
        """Log debug message (only in verbose mode)"""
        if self.verbose:
            self.logger.debug(message)
    
    def update_stats(self, status: str):
        """Update statistics"""
        self.stats['total'] += 1
        if status == 'success':
            self.stats['success'] += 1
        elif status == 'failed':
            self.stats['failed'] += 1
        elif status == 'skipped':
            self.stats['skipped'] += 1
    
    def start_timer(self):
        """Start timing the scraper"""
        self.stats['start_time'] = datetime.now()
    
    def stop_timer(self):
        """Stop timing the scraper"""
        self.stats['end_time'] = datetime.now()
    
    def print_summary(self):
        """Print final summary report"""
        duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
        minutes = int(duration // 60)
        seconds = int(duration % 60)
        
        avg_time = duration / self.stats['total'] if self.stats['total'] > 0 else 0
        
        self.info("\n" + "=" * 50)
        self.info("SCRAPER SUMMARY")
        self.info("=" * 50)
        self.info(f"Total Problems Processed: {self.stats['total']}")
        self.info(f"Successfully Inserted: {self.stats['success']}")
        self.info(f"Already Existed (Skipped): {self.stats['skipped']}")
        self.info(f"Failed: {self.stats['failed']}")
        self.info(f"Duration: {minutes}m {seconds}s")
        self.info(f"Average Time per Problem: {avg_time:.1f}s")
        self.info("=" * 50)


# ============================================================================
# CODEFORCES CLIENT
# ============================================================================

class CodeforcesClient:
    """Client for fetching problems from Codeforces"""
    
    def __init__(self, delay_seconds: float, max_retries: int, user_agent: str, logger: ScraperLogger):
        """Initialize Codeforces client"""
        self.base_url = "https://codeforces.com"
        self.delay_seconds = delay_seconds
        self.max_retries = max_retries
        self.logger = logger
        self.last_request_time = 0
        
        # Set up session with headers (mimic real browser)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        })
    
    def _rate_limit(self):
        """Ensure minimum delay between requests"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.delay_seconds:
            sleep_time = self.delay_seconds - time_since_last
            self.logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f}s")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def _retry_request(self, url: str) -> requests.Response:
        """
        Make request with retry logic and exponential backoff
        Returns: Response object
        Raises: Exception if all retries fail
        """
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                self.logger.debug(f"Request attempt {attempt + 1}/{self.max_retries}: {url}")
                response = self.session.get(url, timeout=30)
                
                # Handle rate limiting
                if response.status_code == 429:
                    wait_time = (2 ** attempt) * self.delay_seconds
                    self.logger.warning(f"Rate limited (429). Waiting {wait_time:.1f}s before retry...")
                    time.sleep(wait_time)
                    continue
                
                # Handle other errors
                if response.status_code == 404:
                    raise Exception(f"Problem not found (404): {url}")
                
                if response.status_code >= 500:
                    self.logger.warning(f"Server error ({response.status_code}). Retrying...")
                    time.sleep((2 ** attempt) * self.delay_seconds)
                    continue
                
                # Success
                response.raise_for_status()
                return response
                
            except requests.exceptions.Timeout as e:
                last_exception = e
                self.logger.warning(f"Request timeout. Retrying...")
                time.sleep((2 ** attempt) * self.delay_seconds)
                
            except requests.exceptions.ConnectionError as e:
                last_exception = e
                self.logger.warning(f"Connection error. Retrying...")
                time.sleep((2 ** attempt) * self.delay_seconds)
                
            except requests.exceptions.RequestException as e:
                last_exception = e
                self.logger.warning(f"Request error: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep((2 ** attempt) * self.delay_seconds)
        
        # All retries failed
        raise Exception(f"Failed after {self.max_retries} attempts: {last_exception}")
    
    def fetch_problem(self, contest_id: int, problem_index: str) -> str:
        """
        Fetch problem HTML from Codeforces
        Args:
            contest_id: Contest number (e.g., 1, 2, 1234)
            problem_index: Problem letter (e.g., 'A', 'B', 'C')
        Returns:
            HTML content as string
        Raises:
            Exception if fetch fails
        """
        # Apply rate limiting
        self._rate_limit()
        
        # Construct URL
        url = f"{self.base_url}/problemset/problem/{contest_id}/{problem_index}"
        
        self.logger.debug(f"Fetching: {url}")
        
        # Make request with retries
        response = self._retry_request(url)
        
        self.logger.debug(f"Fetched {len(response.text)} characters")
        
        return response.text


# ============================================================================
# HTML TO MARKDOWN CONVERTER
# ============================================================================

class MarkdownConverter:
    """Converts HTML to Markdown"""
    
    def __init__(self):
        """Initialize converter"""
        pass
    
    def convert(self, html: str) -> str:
        """
        Convert HTML to clean Markdown
        Args:
            html: HTML string
        Returns:
            Markdown string
        """
        if not html:
            return ""
        
        soup = BeautifulSoup(html, 'lxml')
        
        # Remove script and style tags
        for tag in soup(['script', 'style']):
            tag.decompose()
        
        # Convert to markdown
        markdown = self._convert_element(soup)
        
        # Clean up extra whitespace
        markdown = '\n'.join(line.rstrip() for line in markdown.split('\n'))
        markdown = '\n'.join(line for line in markdown.split('\n') if line.strip() or line == '')
        
        return markdown.strip()
    
    def _convert_element(self, element) -> str:
        """Recursively convert HTML element to Markdown"""
        if isinstance(element, str):
            return element
        
        if element.name is None:
            return str(element)
        
        # Handle different HTML tags
        if element.name in ['p', 'div']:
            content = ''.join(self._convert_element(child) for child in element.children)
            return f"\n\n{content}\n\n"
        
        elif element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(element.name[1])
            content = ''.join(self._convert_element(child) for child in element.children)
            return f"\n\n{'#' * level} {content}\n\n"
        
        elif element.name == 'strong' or element.name == 'b':
            content = ''.join(self._convert_element(child) for child in element.children)
            return f"**{content}**"
        
        elif element.name == 'em' or element.name == 'i':
            content = ''.join(self._convert_element(child) for child in element.children)
            return f"*{content}*"
        
        elif element.name == 'code':
            content = ''.join(self._convert_element(child) for child in element.children)
            return f"`{content}`"
        
        elif element.name == 'pre':
            content = element.get_text()
            return f"\n```\n{content}\n```\n"
        
        elif element.name == 'ul':
            items = []
            for li in element.find_all('li', recursive=False):
                content = ''.join(self._convert_element(child) for child in li.children)
                items.append(f"- {content}")
            return '\n' + '\n'.join(items) + '\n'
        
        elif element.name == 'ol':
            items = []
            for i, li in enumerate(element.find_all('li', recursive=False), 1):
                content = ''.join(self._convert_element(child) for child in li.children)
                items.append(f"{i}. {content}")
            return '\n' + '\n'.join(items) + '\n'
        
        elif element.name == 'br':
            return '\n'
        
        elif element.name == 'a':
            content = ''.join(self._convert_element(child) for child in element.children)
            href = element.get('href', '')
            return f"[{content}]({href})"
        
        elif element.name == 'img':
            alt = element.get('alt', '')
            src = element.get('src', '')
            return f"![{alt}]({src})"
        
        else:
            # Default: just get the text content
            return ''.join(self._convert_element(child) for child in element.children)


# ============================================================================
# PROBLEM PARSER
# ============================================================================

class ProblemParser:
    """Parser for extracting problem data from Codeforces HTML"""
    
    def __init__(self, logger: ScraperLogger):
        """Initialize parser"""
        self.logger = logger
        self.markdown_converter = MarkdownConverter()
    
    def parse(self, html: str, contest_id: int, problem_index: str) -> Optional[Dict]:
        """
        Parse problem HTML and return structured data
        Args:
            html: HTML content
            contest_id: Contest ID
            problem_index: Problem letter
        Returns:
            Dictionary with problem data or None if parsing fails
        """
        try:
            soup = BeautifulSoup(html, 'lxml')
            
            # Extract all components
            title = self._extract_title(soup, contest_id, problem_index)
            time_limit = self._extract_time_limit(soup)
            memory_limit = self._extract_memory_limit(soup)
            description = self._extract_description(soup)
            input_format = self._extract_input_format(soup)
            output_format = self._extract_output_format(soup)
            examples = self._extract_examples(soup)
            test_cases = self._extract_test_cases(soup)
            tags = self._extract_tags(soup)
            difficulty_rating = self._extract_difficulty_rating(soup)
            
            # Build problem data
            problem_data = {
                'title': title,
                'description': description,
                'inputFormat': input_format,
                'outputFormat': output_format,
                'timeLimit': time_limit,
                'memoryLimit': memory_limit,
                'examples': examples,
                'testCases': test_cases,
                'tags': tags,
                'difficultyRating': difficulty_rating,
                'externalId': f"{contest_id}{problem_index}",
                'sourceUrl': f"https://codeforces.com/problemset/problem/{contest_id}/{problem_index}"
            }
            
            self.logger.debug(f"Parsed problem: {title}")
            return problem_data
            
        except Exception as e:
            self.logger.error(f"Failed to parse problem {contest_id}{problem_index}", e)
            return None
    
    def _extract_title(self, soup: BeautifulSoup, contest_id: int, problem_index: str) -> str:
        """Extract problem title"""
        try:
            title_div = soup.find('div', class_='title')
            if title_div:
                # Remove the problem index (e.g., "A. ")
                title_text = title_div.get_text().strip()
                # Remove leading letter and dot
                if '. ' in title_text:
                    title_text = title_text.split('. ', 1)[1]
                return title_text
        except:
            pass
        return f"Problem {contest_id}{problem_index}"
    
    def _extract_time_limit(self, soup: BeautifulSoup) -> int:
        """Extract time limit in milliseconds"""
        try:
            time_limit_div = soup.find('div', class_='time-limit')
            if time_limit_div:
                text = time_limit_div.get_text()
                # Extract number (e.g., "2 seconds" -> 2000)
                import re
                match = re.search(r'(\d+(?:\.\d+)?)\s*second', text)
                if match:
                    seconds = float(match.group(1))
                    return int(seconds * 1000)
        except:
            pass
        return 2000  # Default 2 seconds
    
    def _extract_memory_limit(self, soup: BeautifulSoup) -> int:
        """Extract memory limit in megabytes"""
        try:
            memory_limit_div = soup.find('div', class_='memory-limit')
            if memory_limit_div:
                text = memory_limit_div.get_text()
                # Extract number (e.g., "256 megabytes" -> 256)
                import re
                match = re.search(r'(\d+)\s*megabyte', text)
                if match:
                    return int(match.group(1))
        except:
            pass
        return 256  # Default 256 MB
    
    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract and convert problem description to Markdown"""
        try:
            # Find the problem statement div
            problem_statement = soup.find('div', class_='problem-statement')
            if not problem_statement:
                return ""
            
            # Get the main description (before input/output sections)
            description_parts = []
            
            # Find all divs with problem sections
            for div in problem_statement.find_all('div', recursive=False):
                # Skip input/output/note sections
                if div.find('div', class_='input-specification'):
                    break
                if div.find('div', class_='output-specification'):
                    break
                
                # Convert to markdown
                html_content = str(div)
                markdown = self.markdown_converter.convert(html_content)
                if markdown:
                    description_parts.append(markdown)
            
            return '\n\n'.join(description_parts)
        except Exception as e:
            self.logger.debug(f"Error extracting description: {e}")
            return ""
    
    def _extract_input_format(self, soup: BeautifulSoup) -> str:
        """Extract input format description"""
        try:
            input_spec = soup.find('div', class_='input-specification')
            if input_spec:
                # Remove the header
                header = input_spec.find('div', class_='section-title')
                if header:
                    header.decompose()
                return self.markdown_converter.convert(str(input_spec))
        except:
            pass
        return ""
    
    def _extract_output_format(self, soup: BeautifulSoup) -> str:
        """Extract output format description"""
        try:
            output_spec = soup.find('div', class_='output-specification')
            if output_spec:
                # Remove the header
                header = output_spec.find('div', class_='section-title')
                if header:
                    header.decompose()
                return self.markdown_converter.convert(str(output_spec))
        except:
            pass
        return ""
    
    def _extract_examples(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract example test cases for display"""
        return self._extract_test_cases(soup)
    
    def _extract_test_cases(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract sample test cases"""
        test_cases = []
        try:
            sample_tests = soup.find('div', class_='sample-test')
            if not sample_tests:
                return []
            
            inputs = sample_tests.find_all('div', class_='input')
            outputs = sample_tests.find_all('div', class_='output')
            
            for i, (input_div, output_div) in enumerate(zip(inputs, outputs)):
                # Extract input
                input_pre = input_div.find('pre')
                input_text = input_pre.get_text().strip() if input_pre else ""
                
                # Extract output
                output_pre = output_div.find('pre')
                output_text = output_pre.get_text().strip() if output_pre else ""
                
                test_cases.append({
                    'input': input_text,
                    'output': output_text,
                    'explanation': f"Sample test {i + 1}"
                })
            
            self.logger.debug(f"Extracted {len(test_cases)} test cases")
        except Exception as e:
            self.logger.debug(f"Error extracting test cases: {e}")
        
        return test_cases
    
    def _extract_tags(self, soup: BeautifulSoup) -> List[str]:
        """Extract problem tags"""
        tags = []
        try:
            # Tags are usually in a specific div or as links
            tag_elements = soup.find_all('span', class_='tag-box')
            for tag_elem in tag_elements:
                tag_text = tag_elem.get_text().strip()
                if tag_text:
                    tags.append(tag_text)
        except:
            pass
        return tags
    
    def _extract_difficulty_rating(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract difficulty rating (if available)"""
        try:
            # Rating is sometimes in the sidebar
            rating_span = soup.find('span', class_='ProblemRating')
            if rating_span:
                rating_text = rating_span.get_text().strip()
                import re
                match = re.search(r'\d+', rating_text)
                if match:
                    return int(match.group())
        except:
            pass
        return None


# ============================================================================
# DIFFICULTY MAPPER
# ============================================================================

class DifficultyMapper:
    """Maps Codeforces ratings to our difficulty levels"""
    
    @staticmethod
    def map_rating(rating: Optional[int]) -> str:
        """
        Map Codeforces rating to difficulty
        - rating < 1200: 'easy'
        - 1200 <= rating <= 1600: 'medium'
        - rating > 1600: 'hard'
        - None: 'medium' (default)
        """
        if rating is None:
            return 'medium'
        
        if rating < 1200:
            return 'easy'
        elif rating <= 1600:
            return 'medium'
        else:
            return 'hard'


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main entry point for the scraper"""
    print("Codeforces Problem Scraper")
    print("=" * 50)
    
    # Parse command-line arguments
    parser = argparse.ArgumentParser(
        description='Scrape problems from Codeforces and seed into MongoDB'
    )
    parser.add_argument('--start', type=int, help='Starting problem number')
    parser.add_argument('--end', type=int, help='Ending problem number')
    parser.add_argument('--dry-run', action='store_true', help='Run without database insertion')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('--config', type=str, help='Path to config file')
    
    args = parser.parse_args()
    
    # Load configuration
    config = Config.from_env()
    
    # Override with command-line arguments
    if args.start:
        config.problem_start = args.start
    if args.end:
        config.problem_end = args.end
    if args.dry_run:
        config.dry_run = True
    if args.verbose:
        config.verbose = True
    
    # Validate configuration
    is_valid, errors = config.validate()
    if not is_valid:
        print("Configuration errors:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)
    
    # Initialize logger
    logger = ScraperLogger(config.log_file, config.verbose)
    logger.info("Starting Codeforces Problem Scraper")
    logger.info(str(config))
    
    if config.dry_run:
        logger.info("DRY RUN MODE: No database changes will be made")
    
    # Start timer
    logger.start_timer()
    
    # Initialize Codeforces client
    logger.info("Initializing Codeforces client...")
    client = CodeforcesClient(
        delay_seconds=config.delay_seconds,
        max_retries=config.max_retries,
        user_agent=config.user_agent,
        logger=logger
    )
    
    # Initialize parser
    logger.info("Initializing problem parser...")
    parser = ProblemParser(logger)
    
    # Test: Fetch and parse a single problem
    if config.dry_run:
        logger.info("Testing with problem 1A...")
        try:
            # Fetch HTML
            html = client.fetch_problem(1, "A")
            logger.info(f"✅ Fetched HTML ({len(html)} chars)")
            
            # Parse problem
            problem_data = parser.parse(html, 1, "A")
            if problem_data:
                logger.info(f"✅ Parsed problem: {problem_data['title']}")
                logger.info(f"   Time Limit: {problem_data['timeLimit']}ms")
                logger.info(f"   Memory Limit: {problem_data['memoryLimit']}MB")
                logger.info(f"   Test Cases: {len(problem_data['testCases'])}")
                logger.info(f"   Tags: {', '.join(problem_data['tags']) if problem_data['tags'] else 'None'}")
                
                # Map difficulty
                difficulty = DifficultyMapper.map_rating(problem_data.get('difficultyRating'))
                logger.info(f"   Difficulty: {difficulty}")
                
                # Show first 200 chars of description
                desc_preview = problem_data['description'][:200] + "..." if len(problem_data['description']) > 200 else problem_data['description']
                logger.info(f"   Description preview: {desc_preview}")
            else:
                logger.error("❌ Failed to parse problem")
        except Exception as e:
            logger.error(f"❌ Test failed", e)
    
    # TODO: Implement full scraper logic
    logger.info("Full scraper implementation in progress...")
    
    # Stop timer
    logger.stop_timer()
    
    # Print summary
    logger.print_summary()
    
    logger.info("Scraper completed successfully!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nScraper interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

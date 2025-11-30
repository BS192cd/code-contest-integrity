#!/usr/bin/env python3
"""
Codeforces Problem Scraper - API Version
=========================================

This script uses the official Codeforces API to fetch problems and seed them into MongoDB.

Features:
- Uses official Codeforces API (no scraping, no 403 errors)
- Fetches problem metadata: name, tags, rating, contest info
- Maps ratings to difficulty levels
- Generates problem descriptions from available data
- Validates data before insertion
- Handles errors gracefully

Usage:
    # Scrape 50 problems
    python seed_problems_api.py --limit 50
    
    # Dry run (no database changes)
    python seed_problems_api.py --limit 10 --dry-run
    
    # Verbose mode
    python seed_problems_api.py --limit 20 --verbose
    
    # Filter by difficulty
    python seed_problems_api.py --min-rating 1200 --max-rating 1600

Dependencies:
    pip install requests pymongo python-dotenv

Environment Variables:
    MONGO_URI - MongoDB connection string (required)
    PROBLEM_LIMIT - Number of problems to scrape (default: 100)
    MIN_RATING - Minimum difficulty rating (default: 800)
    MAX_RATING - Maximum difficulty rating (default: 2000)
    DRY_RUN - Run without database insertion (default: false)
    VERBOSE - Enable verbose logging (default: false)

Author: Coding Platform Team
Date: October 2025
License: MIT
"""

import os
import sys
import json
import logging
import argparse
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# Third-party imports
try:
    import requests
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, DuplicateKeyError
    from dotenv import load_dotenv
    from bson import ObjectId
except ImportError as e:
    print(f"Error: Missing required dependency: {e}")
    print("Please install: pip install requests pymongo python-dotenv")
    sys.exit(1)

# Load environment variables
load_dotenv()

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Configuration manager"""
    
    def __init__(self):
        self.mongo_uri: str = ""
        self.problem_limit: int = 100
        self.min_rating: int = 800
        self.max_rating: int = 2000
        self.dry_run: bool = False
        self.verbose: bool = False
        self.log_file: str = "scraper_api.log"
    
    @classmethod
    def from_env(cls) -> 'Config':
        """Load from environment variables"""
        config = cls()
        config.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/coding-platform')
        config.problem_limit = int(os.getenv('PROBLEM_LIMIT', '100'))
        config.min_rating = int(os.getenv('MIN_RATING', '800'))
        config.max_rating = int(os.getenv('MAX_RATING', '2000'))
        config.dry_run = os.getenv('DRY_RUN', 'false').lower() == 'true'
        config.verbose = os.getenv('VERBOSE', 'false').lower() == 'true'
        return config
    
    def validate(self) -> Tuple[bool, List[str]]:
        """Validate configuration"""
        errors = []
        if not self.mongo_uri:
            errors.append("MONGO_URI is required")
        if self.problem_limit < 1:
            errors.append("PROBLEM_LIMIT must be >= 1")
        if self.min_rating < 0:
            errors.append("MIN_RATING must be >= 0")
        if self.max_rating < self.min_rating:
            errors.append("MAX_RATING must be >= MIN_RATING")
        return len(errors) == 0, errors


# ============================================================================
# LOGGER
# ============================================================================

class ScraperLogger:
    """Logger with statistics"""
    
    def __init__(self, log_file: str, verbose: bool):
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
        
        self.logger = logging.getLogger('CodeforcesAPI')
        self.logger.setLevel(logging.DEBUG if verbose else logging.INFO)
        
        # File handler
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        file_formatter = logging.Formatter('[%(asctime)s] %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        file_handler.setFormatter(file_formatter)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG if verbose else logging.INFO)
        console_formatter = logging.Formatter('[%(asctime)s] %(levelname)s: %(message)s', datefmt='%H:%M:%S')
        console_handler.setFormatter(console_formatter)
        
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def info(self, message: str):
        self.logger.info(message)
    
    def error(self, message: str, exception: Optional[Exception] = None):
        if exception:
            self.logger.error(f"{message}: {str(exception)}")
        else:
            self.logger.error(message)
    
    def warning(self, message: str):
        self.logger.warning(message)
    
    def debug(self, message: str):
        if self.verbose:
            self.logger.debug(message)
    
    def update_stats(self, status: str):
        self.stats['total'] += 1
        if status == 'success':
            self.stats['success'] += 1
        elif status == 'failed':
            self.stats['failed'] += 1
        elif status == 'skipped':
            self.stats['skipped'] += 1
    
    def start_timer(self):
        self.stats['start_time'] = datetime.now()
    
    def stop_timer(self):
        self.stats['end_time'] = datetime.now()
    
    def print_summary(self):
        duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
        minutes = int(duration // 60)
        seconds = int(duration % 60)
        
        self.info("\n" + "=" * 60)
        self.info("SCRAPER SUMMARY")
        self.info("=" * 60)
        self.info(f"Total Problems Processed: {self.stats['total']}")
        self.info(f"Successfully Inserted: {self.stats['success']}")
        self.info(f"Already Existed (Skipped): {self.stats['skipped']}")
        self.info(f"Failed: {self.stats['failed']}")
        self.info(f"Duration: {minutes}m {seconds}s")
        self.info("=" * 60)


# ============================================================================
# CODEFORCES API CLIENT
# ============================================================================

class CodeforcesAPIClient:
    """Client for Codeforces API"""
    
    def __init__(self, logger: ScraperLogger):
        self.base_url = "https://codeforces.com/api"
        self.logger = logger
        self.session = requests.Session()
    
    def fetch_problems(self) -> Optional[Dict]:
        """
        Fetch all problems from Codeforces API
        Returns: Dictionary with 'problems' and 'problemStatistics' lists
        """
        try:
            url = f"{self.base_url}/problemset.problems"
            self.logger.debug(f"Fetching from: {url}")
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data['status'] != 'OK':
                self.logger.error(f"API returned error: {data.get('comment', 'Unknown error')}")
                return None
            
            result = data['result']
            self.logger.info(f"✅ Fetched {len(result['problems'])} problems from API")
            
            return result
            
        except requests.exceptions.RequestException as e:
            self.logger.error("Failed to fetch from Codeforces API", e)
            return None
        except (KeyError, ValueError) as e:
            self.logger.error("Failed to parse API response", e)
            return None


# ============================================================================
# DIFFICULTY MAPPER
# ============================================================================

class DifficultyMapper:
    """Maps Codeforces ratings to difficulty levels"""
    
    @staticmethod
    def map_rating(rating: Optional[int]) -> str:
        """Map rating to easy/medium/hard"""
        if rating is None:
            return 'medium'
        if rating < 1200:
            return 'easy'
        elif rating <= 1600:
            return 'medium'
        else:
            return 'hard'
    
    @staticmethod
    def get_category_from_tags(tags: List[str]) -> str:
        """Map tags to our category system"""
        tag_lower = [t.lower() for t in tags]
        
        if any(t in tag_lower for t in ['dp', 'dynamic programming']):
            return 'Dynamic Programming'
        elif any(t in tag_lower for t in ['graph', 'trees', 'dfs', 'bfs']):
            return 'Graph Theory'
        elif any(t in tag_lower for t in ['data structures', 'dsu', 'segment tree']):
            return 'Data Structure'
        elif any(t in tag_lower for t in ['math', 'number theory', 'combinatorics']):
            return 'Mathematics'
        elif any(t in tag_lower for t in ['strings', 'string']):
            return 'String Processing'
        else:
            return 'Algorithm'


# ============================================================================
# PROBLEM TRANSFORMER
# ============================================================================

class ProblemTransformer:
    """Transforms Codeforces API data to our schema"""
    
    def __init__(self, logger: ScraperLogger):
        self.logger = logger
    
    def transform(self, problem: Dict, statistics: Optional[Dict] = None) -> Optional[Dict]:
        """
        Transform Codeforces problem to our schema
        Args:
            problem: Problem dict from API
            statistics: Problem statistics dict from API
        Returns:
            Transformed problem dict or None
        """
        try:
            # Extract basic info
            contest_id = problem.get('contestId')
            index = problem.get('index')
            name = problem.get('name', 'Untitled Problem')
            problem_type = problem.get('type', 'PROGRAMMING')
            tags = problem.get('tags', [])
            rating = problem.get('rating')
            
            # Skip non-programming problems
            if problem_type != 'PROGRAMMING':
                self.logger.debug(f"Skipping non-programming problem: {name}")
                return None
            
            # Generate external ID
            external_id = f"{contest_id}{index}" if contest_id and index else None
            if not external_id:
                self.logger.debug(f"Skipping problem without ID: {name}")
                return None
            
            # Map difficulty
            difficulty = DifficultyMapper.map_rating(rating)
            category = DifficultyMapper.get_category_from_tags(tags)
            
            # Generate description (since API doesn't provide full statement)
            description = self._generate_description(name, tags, rating, contest_id, index)
            
            # Build problem data
            problem_data = {
                'title': name,
                'description': description,
                'difficulty': difficulty,
                'tags': tags,
                'category': category,
                'timeLimit': 2000,  # Default 2 seconds
                'memoryLimit': 256,  # Default 256 MB
                'examples': [],  # API doesn't provide examples
                'visibleTestCases': [],  # API doesn't provide test cases
                'hiddenTestCases': [],
                'source': 'Codeforces',
                'sourceUrl': f"https://codeforces.com/problemset/problem/{contest_id}/{index}",
                'externalId': external_id,
                'isPublic': True,
                'isActive': True,
                'isVerified': False,
                'inputFormat': 'See problem on Codeforces',
                'outputFormat': 'See problem on Codeforces',
            }
            
            # Add statistics if available
            if statistics:
                solved_count = statistics.get('solvedCount', 0)
                problem_data['statistics'] = {
                    'totalSubmissions': solved_count,
                    'acceptedSubmissions': solved_count,
                    'acceptanceRate': 0,
                    'averageScore': 0
                }
            
            self.logger.debug(f"Transformed: {name} ({difficulty})")
            return problem_data
            
        except Exception as e:
            self.logger.error(f"Failed to transform problem: {problem.get('name', 'Unknown')}", e)
            return None
    
    def _generate_description(self, name: str, tags: List[str], rating: Optional[int], contest_id: int, index: str) -> str:
        """Generate a description from available metadata"""
        parts = []
        
        # Title section
        parts.append(f"# {name}\n")
        
        # Metadata section
        parts.append("## Problem Information\n")
        parts.append(f"- **Source**: Codeforces Problem {contest_id}{index}")
        parts.append(f"- **Difficulty Rating**: {rating if rating else 'Unrated'}")
        parts.append(f"- **Tags**: {', '.join(tags) if tags else 'None'}\n")
        
        # Problem statement placeholder
        parts.append("## Problem Statement\n")
        parts.append(f"This is problem {index} from Codeforces contest {contest_id}.")
        parts.append(f"The problem is tagged with: {', '.join(tags) if tags else 'no specific tags'}.\n")
        
        if rating:
            if rating < 1200:
                parts.append("This is considered an **easy** problem, suitable for beginners.")
            elif rating <= 1600:
                parts.append("This is considered a **medium** difficulty problem.")
            else:
                parts.append("This is considered a **hard** problem, suitable for advanced programmers.")
        
        parts.append("\n## Full Problem Statement\n")
        parts.append(f"For the complete problem statement, input/output format, examples, and constraints, ")
        parts.append(f"please visit the original problem on Codeforces:\n")
        parts.append(f"[View Problem on Codeforces](https://codeforces.com/problemset/problem/{contest_id}/{index})\n")
        
        # Additional info
        parts.append("## Note\n")
        parts.append("This problem was imported from Codeforces using their official API. ")
        parts.append("The full problem statement, test cases, and examples are available on the Codeforces website.")
        
        return '\n'.join(parts)


# ============================================================================
# DATA VALIDATOR
# ============================================================================

class DataValidator:
    """Validates problem data before insertion"""
    
    def validate(self, problem_data: Dict) -> Tuple[bool, List[str]]:
        """
        Validate problem data
        Returns: (is_valid, error_messages)
        """
        errors = []
        
        # Required fields
        required_fields = ['title', 'description', 'difficulty', 'externalId']
        for field in required_fields:
            if field not in problem_data or not problem_data[field]:
                errors.append(f"Missing required field: {field}")
        
        # Validate difficulty
        if 'difficulty' in problem_data:
            if problem_data['difficulty'] not in ['easy', 'medium', 'hard']:
                errors.append(f"Invalid difficulty: {problem_data['difficulty']}")
        
        # Validate description length (minimum 500 chars required by schema)
        if 'description' in problem_data:
            if len(problem_data['description']) < 500:
                errors.append(f"Description too short: {len(problem_data['description'])} chars (minimum 500)")
        
        # Validate title length
        if 'title' in problem_data:
            if len(problem_data['title']) > 200:
                errors.append(f"Title too long: {len(problem_data['title'])} chars (maximum 200)")
        
        return len(errors) == 0, errors


# ============================================================================
# MONGODB CLIENT
# ============================================================================

class MongoDBClient:
    """MongoDB operations"""
    
    def __init__(self, mongo_uri: str, logger: ScraperLogger):
        self.mongo_uri = mongo_uri
        self.logger = logger
        self.client = None
        self.db = None
        self.problems_collection = None
        self.users_collection = None
        self.system_user_id = None
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            # Test connection
            self.client.admin.command('ping')
            
            # Get database name from URI or use default
            db_name = self.mongo_uri.split('/')[-1].split('?')[0] or 'coding-platform'
            self.db = self.client[db_name]
            self.problems_collection = self.db['problems']
            self.users_collection = self.db['users']
            
            self.logger.info(f"✅ Connected to MongoDB: {db_name}")
            
            # Get or create system user
            self.system_user_id = self._get_system_user_id()
            
        except ConnectionFailure as e:
            self.logger.error("Failed to connect to MongoDB", e)
            raise
    
    def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            self.logger.info("Disconnected from MongoDB")
    
    def _get_system_user_id(self) -> ObjectId:
        """Get or create system user for scraped problems"""
        try:
            # Try to find existing system user
            system_user = self.users_collection.find_one({'email': 'system@codeforces.scraper'})
            
            if system_user:
                self.logger.debug(f"Found existing system user: {system_user['_id']}")
                return system_user['_id']
            
            # Create system user
            system_user = {
                'name': 'Codeforces Scraper',
                'email': 'system@codeforces.scraper',
                'role': 'teacher',
                'password': 'N/A',  # System user, no login
                'createdAt': datetime.now(),
                'updatedAt': datetime.now()
            }
            
            result = self.users_collection.insert_one(system_user)
            self.logger.info(f"Created system user: {result.inserted_id}")
            return result.inserted_id
            
        except Exception as e:
            self.logger.error("Failed to get/create system user", e)
            # Return a default ObjectId if creation fails
            return ObjectId()
    
    def problem_exists(self, external_id: str) -> bool:
        """Check if problem already exists"""
        return self.problems_collection.find_one({'externalId': external_id}) is not None
    
    def insert_problem(self, problem_data: Dict) -> Optional[str]:
        """
        Insert problem into database
        Returns: Inserted problem ID or None
        """
        try:
            # Add createdBy field
            problem_data['createdBy'] = self.system_user_id
            problem_data['createdAt'] = datetime.now()
            problem_data['updatedAt'] = datetime.now()
            
            result = self.problems_collection.insert_one(problem_data)
            self.logger.debug(f"Inserted problem: {problem_data['title']} ({result.inserted_id})")
            return str(result.inserted_id)
            
        except DuplicateKeyError:
            self.logger.warning(f"Duplicate problem: {problem_data.get('title', 'Unknown')}")
            return None
        except Exception as e:
            self.logger.error(f"Failed to insert problem: {problem_data.get('title', 'Unknown')}", e)
            return None


# ============================================================================
# MAIN SCRAPER
# ============================================================================

def main():
    """Main entry point"""
    print("Codeforces Problem Scraper - API Version")
    print("=" * 60)
    
    # Parse arguments
    parser = argparse.ArgumentParser(description='Scrape problems from Codeforces API')
    parser.add_argument('--limit', type=int, help='Number of problems to scrape')
    parser.add_argument('--min-rating', type=int, help='Minimum difficulty rating')
    parser.add_argument('--max-rating', type=int, help='Maximum difficulty rating')
    parser.add_argument('--dry-run', action='store_true', help='Run without database insertion')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Load configuration
    config = Config.from_env()
    
    # Override with CLI arguments
    if args.limit:
        config.problem_limit = args.limit
    if args.min_rating:
        config.min_rating = args.min_rating
    if args.max_rating:
        config.max_rating = args.max_rating
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
    logger.info("Starting Codeforces API Scraper")
    logger.info(f"Problem Limit: {config.problem_limit}")
    logger.info(f"Rating Range: {config.min_rating}-{config.max_rating}")
    
    if config.dry_run:
        logger.info("DRY RUN MODE: No database changes will be made")
    
    logger.start_timer()
    
    try:
        # Initialize components
        api_client = CodeforcesAPIClient(logger)
        transformer = ProblemTransformer(logger)
        validator = DataValidator()
        
        # Fetch problems from API
        logger.info("Fetching problems from Codeforces API...")
        api_data = api_client.fetch_problems()
        
        if not api_data:
            logger.error("Failed to fetch problems from API")
            sys.exit(1)
        
        problems = api_data['problems']
        statistics = {f"{p.get('contestId')}{p.get('index')}": p 
                     for p in api_data.get('problemStatistics', [])}
        
        # Filter by rating
        filtered_problems = [
            p for p in problems
            if config.min_rating <= p.get('rating', 0) <= config.max_rating
        ]
        
        logger.info(f"Filtered to {len(filtered_problems)} problems in rating range")
        
        # Limit number of problems
        problems_to_process = filtered_problems[:config.problem_limit]
        logger.info(f"Processing {len(problems_to_process)} problems")
        
        # Connect to MongoDB (unless dry run)
        db_client = None
        if not config.dry_run:
            db_client = MongoDBClient(config.mongo_uri, logger)
            db_client.connect()
        
        # Process each problem
        for i, problem in enumerate(problems_to_process, 1):
            try:
                # Transform
                problem_data = transformer.transform(
                    problem,
                    statistics.get(f"{problem.get('contestId')}{problem.get('index')}")
                )
                
                if not problem_data:
                    logger.update_stats('skipped')
                    continue
                
                # Validate
                is_valid, errors = validator.validate(problem_data)
                if not is_valid:
                    logger.warning(f"Validation failed for {problem_data['title']}: {', '.join(errors)}")
                    logger.update_stats('failed')
                    continue
                
                # Check if exists
                if not config.dry_run and db_client.problem_exists(problem_data['externalId']):
                    logger.info(f"⏭️  [{i}/{len(problems_to_process)}] Already exists: {problem_data['title']}")
                    logger.update_stats('skipped')
                    continue
                
                # Insert or display
                if config.dry_run:
                    logger.info(f"✅ [{i}/{len(problems_to_process)}] Would insert: {problem_data['title']} ({problem_data['difficulty']})")
                    logger.update_stats('success')
                else:
                    result = db_client.insert_problem(problem_data)
                    if result:
                        logger.info(f"✅ [{i}/{len(problems_to_process)}] Inserted: {problem_data['title']} ({problem_data['difficulty']})")
                        logger.update_stats('success')
                    else:
                        logger.update_stats('failed')
                
                # Progress update every 10 problems
                if i % 10 == 0:
                    logger.info(f"Progress: {i}/{len(problems_to_process)} ({int(i/len(problems_to_process)*100)}%)")
                
            except Exception as e:
                logger.error(f"Error processing problem {i}", e)
                logger.update_stats('failed')
        
        # Disconnect
        if db_client:
            db_client.disconnect()
        
    except KeyboardInterrupt:
        logger.info("\n\nScraper interrupted by user")
    except Exception as e:
        logger.error("Fatal error", e)
        import traceback
        traceback.print_exc()
    finally:
        logger.stop_timer()
        logger.print_summary()
        logger.info("Scraper completed!")


if __name__ == "__main__":
    main()

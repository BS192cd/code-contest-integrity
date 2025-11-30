#!/usr/bin/env python3
"""
Codeforces Full Problem Scraper
Combines API (for list) + HTML scraping (for details)
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import sys
import re

class CodeforcesFullScraper:
    def __init__(self):
        self.api_url = "https://codeforces.com/api/problemset.problems"
        self.base_url = "https://codeforces.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def fetch_problem_list(self, limit=50, min_rating=None, max_rating=None):
        """Fetch problem list from API"""
        print("📡 Fetching problem list from Codeforces API...")
        
        try:
            response = self.session.get(self.api_url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') == 'OK':
                problems = data['result']['problems']
                stats_map = {}
                for stat in data['result'].get('problemStatistics', []):
                    key = f"{stat['contestId']}{stat['index']}"
                    stats_map[key] = stat
                
                # Filter by rating
                filtered = []
                for p in problems:
                    rating = p.get('rating')
                    if min_rating and (not rating or rating < min_rating):
                        continue
                    if max_rating and (not rating or rating > max_rating):
                        continue
                    filtered.append(p)
                
                print(f"✅ Found {len(filtered)} problems matching criteria")
                return filtered[:limit], stats_map
            
            return [], {}
        except Exception as e:
            print(f"❌ Error: {e}")
            return [], {}
    
    def scrape_problem_details(self, contest_id, index):
        """Scrape full problem details from HTML page"""
        url = f"{self.base_url}/contest/{contest_id}/problem/{index}"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            details = {}
            
            # Title
            title_div = soup.find('div', class_='title')
            if title_div:
                details['title'] = title_div.get_text(strip=True)
            
            # Time limit
            time_limit = soup.find('div', class_='time-limit')
            if time_limit:
                details['timeLimit'] = time_limit.get_text(strip=True).replace('time limit per test', '').strip()
            
            # Memory limit
            memory_limit = soup.find('div', class_='memory-limit')
            if memory_limit:
                details['memoryLimit'] = memory_limit.get_text(strip=True).replace('memory limit per test', '').strip()
            
            # Input/Output format
            input_spec = soup.find('div', class_='input-specification')
            if input_spec:
                details['inputFormat'] = input_spec.get_text(strip=True).replace('Input', '').strip()
            
            output_spec = soup.find('div', class_='output-specification')
            if output_spec:
                details['outputFormat'] = output_spec.get_text(strip=True).replace('Output', '').strip()
            
            # Problem statement
            problem_statement = soup.find('div', class_='problem-statement')
            if problem_statement:
                # Get the main description (usually in first few divs)
                desc_parts = []
                for div in problem_statement.find_all('div', recursive=False):
                    if 'header' in div.get('class', []):
                        continue
                    if any(cls in div.get('class', []) for cls in ['input-specification', 'output-specification', 'sample-tests', 'note']):
                        break
                    text = div.get_text(strip=True)
                    if text and len(text) > 20:
                        desc_parts.append(text)
                
                if desc_parts:
                    details['description'] = ' '.join(desc_parts[:3])  # First 3 paragraphs
            
            # Sample tests
            sample_test = soup.find('div', class_='sample-test')
            if sample_test:
                inputs = sample_test.find_all('div', class_='input')
                outputs = sample_test.find_all('div', class_='output')
                
                test_cases = []
                for inp, out in zip(inputs, outputs):
                    input_pre = inp.find('pre')
                    output_pre = out.find('pre')
                    
                    if input_pre and output_pre:
                        test_cases.append({
                            'input': input_pre.get_text(strip=False).strip(),
                            'output': output_pre.get_text(strip=False).strip()
                        })
                
                details['sampleTests'] = test_cases
            
            # Note section (often contains important info)
            note = soup.find('div', class_='note')
            if note:
                note_text = note.get_text(strip=True).replace('Note', '').strip()
                if note_text and len(note_text) > 10:
                    details['note'] = note_text[:500]  # First 500 chars
            
            return details
            
        except Exception as e:
            print(f"  ⚠️  Error scraping {url}: {e}")
            return {}
    
    def scrape_problems(self, limit=5, min_rating=None, max_rating=None):
        """Scrape problems with full details"""
        print(f"\n{'='*80}")
        print(f"🚀 Codeforces Full Scraper (Limit: {limit} problems)")
        if min_rating or max_rating:
            print(f"   Rating: {min_rating or 'any'} - {max_rating or 'any'}")
        print(f"{'='*80}\n")
        
        # Get problem list from API
        problems, stats_map = self.fetch_problem_list(limit * 2, min_rating, max_rating)
        
        if not problems:
            return []
        
        print(f"\n📚 Scraping detailed information...\n")
        
        scraped = []
        count = 0
        
        for problem in problems:
            if count >= limit:
                break
            
            contest_id = problem.get('contestId')
            index = problem.get('index')
            
            if not contest_id or not index:
                continue
            
            print(f"[{count + 1}/{limit}] {contest_id}{index}: {problem.get('name')}")
            
            # Get details from HTML
            details = self.scrape_problem_details(contest_id, index)
            
            if details:
                # Combine API data with scraped details
                key = f"{contest_id}{index}"
                stats = stats_map.get(key, {})
                
                full_problem = {
                    'contestId': contest_id,
                    'index': index,
                    'name': problem.get('name'),
                    'rating': problem.get('rating'),
                    'tags': problem.get('tags', []),
                    'solvedCount': stats.get('solvedCount', 0),
                    'url': f"{self.base_url}/contest/{contest_id}/problem/{index}",
                    **details  # Add all scraped details
                }
                
                scraped.append(full_problem)
                count += 1
                
                # Show what we got
                test_count = len(details.get('sampleTests', []))
                print(f"         ✓ {test_count} sample tests | {len(details.get('description', ''))} chars description")
            
            # Be respectful - wait between requests
            time.sleep(2)
        
        print(f"\n{'='*80}")
        print(f"✅ Successfully scraped {len(scraped)} problems with full details")
        print(f"{'='*80}\n")
        
        return scraped
    
    def save_to_file(self, problems, filename='codeforces_full.json'):
        """Save to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(problems, f, indent=2, ensure_ascii=False)
            print(f"💾 Saved to {filename}")
        except Exception as e:
            print(f"❌ Error saving: {e}")
    
    def display_summary(self, problems):
        """Display summary"""
        print("\n📊 SCRAPING SUMMARY")
        print("="*80)
        
        for i, p in enumerate(problems, 1):
            print(f"\n{i}. {p.get('name')}")
            print(f"   ID: {p.get('contestId')}{p.get('index')}")
            print(f"   Rating: {p.get('rating', 'N/A')}")
            print(f"   Tags: {', '.join(p.get('tags', [])[:3])}")
            print(f"   Sample Tests: {len(p.get('sampleTests', []))}")
            print(f"   Description: {len(p.get('description', ''))} characters")
            print(f"   URL: {p.get('url')}")
            
            # Show first test case
            if p.get('sampleTests'):
                test = p['sampleTests'][0]
                print(f"   First Test Input: {test['input'][:50]}...")
                print(f"   First Test Output: {test['output'][:50]}...")

def main():
    limit = 5
    min_rating = None
    max_rating = None
    
    if len(sys.argv) > 1:
        limit = int(sys.argv[1])
    if len(sys.argv) > 2:
        min_rating = int(sys.argv[2])
    if len(sys.argv) > 3:
        max_rating = int(sys.argv[3])
    
    scraper = CodeforcesFullScraper()
    problems = scraper.scrape_problems(limit, min_rating, max_rating)
    
    if problems:
        scraper.display_summary(problems)
        scraper.save_to_file(problems)
        
        print("\n" + "="*80)
        print("🎉 Done! Check codeforces_full.json for complete data")
        print("="*80)
        print("\n⚠️  Note: HTML scraping is slower (2 sec per problem)")
        print("Usage: python scrape_codeforces_full.py [limit] [min_rating] [max_rating]")
        print("Example: python scrape_codeforces_full.py 10 800 1200")
    else:
        print("\n❌ No problems scraped")

if __name__ == "__main__":
    main()

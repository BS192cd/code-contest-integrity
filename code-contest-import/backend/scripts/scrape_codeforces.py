#!/usr/bin/env python3
"""
Codeforces Problem Fetcher (API-Only Version)
Fetches problems from Codeforces API - no HTML scraping needed!
"""

import requests
import json
import time
import sys

class CodeforcesFetcher:
    def __init__(self):
        self.api_url = "https://codeforces.com/api/problemset.problems"
        self.base_url = "https://codeforces.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def fetch_problem_list(self):
        """Fetch the list of problems from Codeforces API"""
        print("📡 Fetching problem list from Codeforces API...")
        
        try:
            response = self.session.get(self.api_url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') == 'OK':
                problems = data['result']['problems']
                problem_stats = data['result'].get('problemStatistics', [])
                
                # Create a map of problem stats for quick lookup
                stats_map = {}
                for stat in problem_stats:
                    key = f"{stat['contestId']}{stat['index']}"
                    stats_map[key] = stat
                
                print(f"✅ Successfully fetched {len(problems)} problems")
                return problems, stats_map
            else:
                print(f"❌ API returned error: {data.get('comment', 'Unknown error')}")
                return [], {}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching problem list: {e}")
            return [], {}
    
    def process_problem(self, problem, stats_map):
        """Process a single problem and enrich with statistics"""
        contest_id = problem.get('contestId')
        index = problem.get('index')
        
        if not contest_id or not index:
            return None
        
        # Get problem statistics
        key = f"{contest_id}{index}"
        stats = stats_map.get(key, {})
        
        # Build comprehensive problem data
        problem_data = {
            'contestId': contest_id,
            'index': index,
            'name': problem.get('name'),
            'type': problem.get('type'),
            'rating': problem.get('rating'),
            'tags': problem.get('tags', []),
            'solvedCount': stats.get('solvedCount', 0),
            'url': f"{self.base_url}/contest/{contest_id}/problem/{index}",
            'points': problem.get('points'),
        }
        
        # Parse time and memory limits from problem metadata if available
        # Note: These are typically in the HTML, but we can provide defaults
        problem_data['timeLimit'] = '2 seconds'  # Default
        problem_data['memoryLimit'] = '256 megabytes'  # Default
        
        return problem_data
    
    def fetch_problems(self, limit=5, min_rating=None, max_rating=None, tags=None):
        """Fetch a limited number of problems with optional filters"""
        print(f"\n{'='*80}")
        print(f"🚀 Starting Codeforces Problem Fetcher (Limit: {limit} problems)")
        if min_rating or max_rating:
            print(f"   Rating filter: {min_rating or 'any'} - {max_rating or 'any'}")
        if tags:
            print(f"   Tags filter: {', '.join(tags)}")
        print(f"{'='*80}\n")
        
        # Step 1: Fetch problem list
        problems, stats_map = self.fetch_problem_list()
        
        if not problems:
            print("❌ No problems to fetch")
            return []
        
        # Step 2: Process each problem
        fetched_problems = []
        count = 0
        
        print(f"\n📚 Processing problems...\n")
        
        for problem in problems:
            if count >= limit:
                break
            
            # Apply filters
            rating = problem.get('rating')
            problem_tags = problem.get('tags', [])
            
            # Rating filter
            if min_rating and (not rating or rating < min_rating):
                continue
            if max_rating and (not rating or rating > max_rating):
                continue
            
            # Tags filter
            if tags and not any(tag in problem_tags for tag in tags):
                continue
            
            problem_data = self.process_problem(problem, stats_map)
            
            if problem_data:
                print(f"[{count + 1}/{limit}] {problem_data['contestId']}{problem_data['index']}: {problem_data['name']}")
                print(f"         Rating: {problem_data['rating'] or 'N/A'} | Solved: {problem_data['solvedCount']}")
                
                fetched_problems.append(problem_data)
                count += 1
        
        print(f"\n{'='*80}")
        print(f"✅ Fetching complete! Successfully fetched {len(fetched_problems)} problems")
        print(f"{'='*80}\n")
        
        return fetched_problems
    
    def save_to_file(self, problems, filename='codeforces_problems.json'):
        """Save fetched problems to a JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(problems, f, indent=2, ensure_ascii=False)
            print(f"💾 Saved to {filename}")
        except Exception as e:
            print(f"❌ Error saving to file: {e}")
    
    def display_summary(self, problems):
        """Display a summary of fetched problems"""
        print("\n📊 FETCHING SUMMARY")
        print("="*80)
        
        for i, problem in enumerate(problems, 1):
            print(f"\n{i}. {problem.get('name', 'Unknown Title')}")
            print(f"   ID: {problem.get('contestId')}{problem.get('index')}")
            print(f"   Rating: {problem.get('rating', 'N/A')}")
            print(f"   Solved: {problem.get('solvedCount', 0)} times")
            print(f"   Tags: {', '.join(problem.get('tags', []))[:60]}")
            print(f"   URL: {problem.get('url')}")

def main():
    # Parse command line arguments
    limit = 5
    min_rating = None
    max_rating = None
    tags = None
    
    if len(sys.argv) > 1:
        limit = int(sys.argv[1])
    if len(sys.argv) > 2:
        min_rating = int(sys.argv[2])
    if len(sys.argv) > 3:
        max_rating = int(sys.argv[3])
    if len(sys.argv) > 4:
        tags = sys.argv[4].split(',')
    
    fetcher = CodeforcesFetcher()
    problems = fetcher.fetch_problems(
        limit=limit,
        min_rating=min_rating,
        max_rating=max_rating,
        tags=tags
    )
    
    if problems:
        fetcher.display_summary(problems)
        fetcher.save_to_file(problems)
        
        print("\n" + "="*80)
        print("🎉 All done! Check codeforces_problems.json for the full data")
        print("="*80)
        print("\nUsage: python scrape_codeforces.py [limit] [min_rating] [max_rating] [tags]")
        print("Example: python scrape_codeforces.py 10 800 1200 dp,greedy")
    else:
        print("\n❌ No problems were fetched")

if __name__ == "__main__":
    main()

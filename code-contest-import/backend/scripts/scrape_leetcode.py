#!/usr/bin/env python3
"""
LeetCode Problem Fetcher (Unofficial GraphQL API)
WARNING: This uses LeetCode's internal API which is not officially supported
Use at your own risk and respect their Terms of Service
"""

import requests
import json
import sys

class LeetCodeFetcher:
    def __init__(self):
        self.base_url = "https://leetcode.com"
        self.graphql_url = f"{self.base_url}/graphql"
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Referer": f"{self.base_url}/problemset/all/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
    
    def fetch_problem_list(self, limit=50, skip=0, difficulty=None):
        """Fetch problem list using GraphQL"""
        query = """
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            total: totalNum
            questions: data {
              acRate
              difficulty
              freqBar
              frontendQuestionId: questionFrontendId
              isFavor
              paidOnly: isPaidOnly
              status
              title
              titleSlug
              topicTags {
                name
                id
                slug
              }
              hasSolution
              hasVideoSolution
            }
          }
        }
        """
        
        filters = {}
        if difficulty:
            filters["difficulty"] = difficulty.upper()
        
        variables = {
            "categorySlug": "",
            "limit": limit,
            "skip": skip,
            "filters": filters
        }
        
        try:
            response = self.session.post(
                self.graphql_url,
                json={"query": query, "variables": variables},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if 'data' in data and 'problemsetQuestionList' in data['data']:
                result = data['data']['problemsetQuestionList']
                return result['questions'], result['total']
            return [], 0
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching problems: {e}")
            return [], 0
        except Exception as e:
            print(f"❌ Error parsing response: {e}")
            return [], 0
    
    def fetch_problems(self, limit=10, difficulty=None, skip_premium=True):
        """Fetch problems with filters"""
        print(f"\n{'='*80}")
        print(f"🚀 Starting LeetCode Problem Fetcher (Limit: {limit} problems)")
        if difficulty:
            print(f"   Difficulty filter: {difficulty}")
        if skip_premium:
            print(f"   Skipping premium problems")
        print(f"{'='*80}\n")
        
        print("📡 Fetching problem list from LeetCode GraphQL API...")
        
        # Fetch more than needed to account for premium problems
        fetch_limit = limit * 3 if skip_premium else limit
        problems, total = self.fetch_problem_list(limit=fetch_limit, difficulty=difficulty)
        
        if not problems:
            print("❌ No problems fetched")
            return []
        
        print(f"✅ Successfully fetched {len(problems)} problems (Total available: {total})")
        print(f"\n📚 Processing problems...\n")
        
        result = []
        count = 0
        
        for p in problems:
            if count >= limit:
                break
            
            # Skip premium problems if requested
            if skip_premium and p['paidOnly']:
                continue
            
            problem = {
                'id': p['frontendQuestionId'],
                'title': p['title'],
                'slug': p['titleSlug'],
                'difficulty': p['difficulty'],
                'tags': [tag['name'] for tag in p['topicTags']],
                'acceptanceRate': round(p['acRate'], 2),
                'isPremium': p['paidOnly'],
                'hasSolution': p.get('hasSolution', False),
                'hasVideoSolution': p.get('hasVideoSolution', False),
                'url': f"{self.base_url}/problems/{p['titleSlug']}/"
            }
            
            result.append(problem)
            count += 1
            
            # Display progress
            premium_badge = "🔒" if problem['isPremium'] else "  "
            print(f"[{count}/{limit}] {premium_badge} {problem['id']}. {problem['title']}")
            print(f"         Difficulty: {problem['difficulty']} | Acceptance: {problem['acceptanceRate']}%")
        
        print(f"\n{'='*80}")
        print(f"✅ Fetching complete! Successfully fetched {len(result)} problems")
        print(f"{'='*80}\n")
        
        return result
    
    def save_to_file(self, problems, filename='leetcode_problems.json'):
        """Save problems to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(problems, f, indent=2, ensure_ascii=False)
            print(f"💾 Saved to {filename}")
        except Exception as e:
            print(f"❌ Error saving to file: {e}")
    
    def display_summary(self, problems):
        """Display summary of fetched problems"""
        print("\n📊 FETCHING SUMMARY")
        print("="*80)
        
        # Statistics
        difficulties = {}
        for p in problems:
            diff = p['difficulty']
            difficulties[diff] = difficulties.get(diff, 0) + 1
        
        print(f"\nTotal Problems: {len(problems)}")
        print(f"Difficulty Breakdown:")
        for diff, count in sorted(difficulties.items()):
            print(f"  - {diff}: {count}")
        
        print(f"\nProblems:")
        for i, problem in enumerate(problems, 1):
            premium = " 🔒" if problem['isPremium'] else ""
            print(f"\n{i}. {problem['title']}{premium}")
            print(f"   ID: {problem['id']} | Difficulty: {problem['difficulty']}")
            print(f"   Acceptance: {problem['acceptanceRate']}%")
            print(f"   Tags: {', '.join(problem['tags'][:5])}")
            print(f"   URL: {problem['url']}")

def main():
    # Parse command line arguments
    limit = 10
    difficulty = None
    skip_premium = True
    
    if len(sys.argv) > 1:
        limit = int(sys.argv[1])
    if len(sys.argv) > 2:
        difficulty = sys.argv[2].lower()
        if difficulty not in ['easy', 'medium', 'hard']:
            print(f"Invalid difficulty: {difficulty}")
            print("Valid options: easy, medium, hard")
            return
    if len(sys.argv) > 3:
        skip_premium = sys.argv[3].lower() != 'false'
    
    fetcher = LeetCodeFetcher()
    problems = fetcher.fetch_problems(
        limit=limit,
        difficulty=difficulty,
        skip_premium=skip_premium
    )
    
    if problems:
        fetcher.display_summary(problems)
        fetcher.save_to_file(problems)
        
        print("\n" + "="*80)
        print("🎉 All done! Check leetcode_problems.json for the full data")
        print("="*80)
        print("\n⚠️  DISCLAIMER: This uses LeetCode's unofficial API")
        print("   Use responsibly and respect their Terms of Service")
        print("\nUsage: python scrape_leetcode.py [limit] [difficulty] [skip_premium]")
        print("Example: python scrape_leetcode.py 20 easy true")
    else:
        print("\n❌ No problems were fetched")

if __name__ == "__main__":
    main()

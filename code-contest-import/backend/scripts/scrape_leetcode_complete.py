#!/usr/bin/env python3
"""
Complete LeetCode Problem Scraper using GraphQL API
Fetches full problem details including description, examples, and constraints
"""

import requests
import json
import time
import sys
import re

class LeetCodeCompleteScraper:
    def __init__(self):
        self.base_url = "https://leetcode.com"
        self.graphql_url = f"{self.base_url}/graphql"
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": f"{self.base_url}/problemset/all/"
        })
    
    def get_problem_list(self, limit=50, skip=0):
        """Get list of problems with basic metadata"""
        query = """
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            questions: data {
              difficulty
              frontendQuestionId: questionFrontendId
              title
              titleSlug
              topicTags {
                name
              }
              paidOnly: isPaidOnly
            }
          }
        }
        """
        
        variables = {
            "categorySlug": "",
            "limit": limit,
            "skip": skip,
            "filters": {}
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
                return data['data']['problemsetQuestionList']['questions']
            return []
        except Exception as e:
            print(f"❌ Error fetching problem list: {e}")
            return []
    
    def get_problem_details(self, title_slug):
        """Get complete problem details including description, examples, constraints"""
        query = """
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            title
            titleSlug
            content
            difficulty
            likes
            dislikes
            exampleTestcases
            topicTags {
              name
              slug
            }
            hints
            solution {
              id
              content
            }
            companyTagStats
            codeSnippets {
              lang
              langSlug
              code
            }
            stats
            similarQuestions
          }
        }
        """
        
        variables = {"titleSlug": title_slug}
        
        try:
            response = self.session.post(
                self.graphql_url,
                json={"query": query, "variables": variables},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if 'data' in data and 'question' in data['data']:
                return data['data']['question']
            return None
        except Exception as e:
            print(f"  ❌ Error fetching details for {title_slug}: {e}")
            return None
    
    def parse_html_content(self, html_content):
        """Parse HTML content to extract description, examples, and constraints"""
        if not html_content:
            return {
                'description': '',
                'examples': [],
                'constraints': []
            }
        
        # Remove HTML tags but keep structure
        from html.parser import HTMLParser
        
        class ContentParser(HTMLParser):
            def __init__(self):
                super().__init__()
                self.text_parts = []
                self.in_pre = False
                self.in_strong = False
                self.current_text = []
            
            def handle_starttag(self, tag, attrs):
                if tag == 'pre':
                    self.in_pre = True
                elif tag == 'strong':
                    self.in_strong = True
                elif tag in ['p', 'div']:
                    if self.current_text:
                        self.text_parts.append(''.join(self.current_text).strip())
                        self.current_text = []
            
            def handle_endtag(self, tag):
                if tag == 'pre':
                    self.in_pre = False
                    if self.current_text:
                        self.text_parts.append('```\n' + ''.join(self.current_text).strip() + '\n```')
                        self.current_text = []
                elif tag == 'strong':
                    self.in_strong = False
            
            def handle_data(self, data):
                if data.strip():
                    if self.in_strong:
                        self.current_text.append(f"**{data}**")
                    else:
                        self.current_text.append(data)
            
            def get_text(self):
                if self.current_text:
                    self.text_parts.append(''.join(self.current_text).strip())
                return '\n\n'.join(self.text_parts)
        
        parser = ContentParser()
        parser.feed(html_content)
        full_text = parser.get_text()
        
        # Extract examples
        examples = []
        example_pattern = r'Example \d+:(.*?)(?=Example \d+:|Constraints:|$)'
        example_matches = re.finditer(example_pattern, full_text, re.DOTALL | re.IGNORECASE)
        
        for match in example_matches:
            example_text = match.group(1).strip()
            
            # Extract Input, Output, Explanation
            input_match = re.search(r'Input:(.*?)(?=Output:|$)', example_text, re.DOTALL | re.IGNORECASE)
            output_match = re.search(r'Output:(.*?)(?=Explanation:|$)', example_text, re.DOTALL | re.IGNORECASE)
            explanation_match = re.search(r'Explanation:(.*?)$', example_text, re.DOTALL | re.IGNORECASE)
            
            example = {}
            if input_match:
                example['input'] = input_match.group(1).strip()
            if output_match:
                example['output'] = output_match.group(1).strip()
            if explanation_match:
                example['explanation'] = explanation_match.group(1).strip()
            
            if example:
                examples.append(example)
        
        # Extract constraints
        constraints = []
        constraints_match = re.search(r'Constraints?:(.*?)(?=\n\n|$)', full_text, re.DOTALL | re.IGNORECASE)
        if constraints_match:
            constraints_text = constraints_match.group(1).strip()
            # Split by newlines and clean up
            constraint_lines = [line.strip() for line in constraints_text.split('\n') if line.strip()]
            constraints = [line.lstrip('•-*').strip() for line in constraint_lines if line.strip()]
        
        # Get description (everything before first Example or Constraints)
        description_match = re.search(r'^(.*?)(?=Example \d+:|Constraints?:|$)', full_text, re.DOTALL | re.IGNORECASE)
        description = description_match.group(1).strip() if description_match else full_text
        
        return {
            'description': description,
            'examples': examples,
            'constraints': constraints
        }
    
    def scrape_problem(self, title_slug):
        """Scrape complete problem data"""
        details = self.get_problem_details(title_slug)
        
        if not details:
            return None
        
        # Parse HTML content
        parsed = self.parse_html_content(details.get('content', ''))
        
        # Build complete problem data
        problem = {
            'url': f"{self.base_url}/problems/{title_slug}/",
            'id': details.get('questionFrontendId'),
            'title': f"{details.get('questionFrontendId')}. {details.get('title')}",
            'titleSlug': title_slug,
            'difficulty': details.get('difficulty'),
            'tags': [tag['name'] for tag in details.get('topicTags', [])],
            'description': parsed['description'],
            'examples': parsed['examples'],
            'constraints': parsed['constraints'],
            'hints': details.get('hints', []),
            'likes': details.get('likes', 0),
            'dislikes': details.get('dislikes', 0)
        }
        
        return problem
    
    def scrape_problems(self, limit=5, skip_premium=True):
        """Scrape multiple problems"""
        print(f"\n{'='*80}")
        print(f"🚀 LeetCode Complete Scraper")
        print(f"   Target: {limit} problems")
        print(f"   Skip Premium: {skip_premium}")
        print(f"{'='*80}\n")
        
        # Get problem list
        print("📡 Fetching problem list...")
        problem_list = self.get_problem_list(limit=limit * 3, skip=0)
        
        if not problem_list:
            print("❌ Failed to fetch problem list")
            return []
        
        print(f"✅ Found {len(problem_list)} problems\n")
        print("📚 Scraping detailed information...\n")
        
        scraped = []
        count = 0
        
        for problem_meta in problem_list:
            if count >= limit:
                break
            
            # Skip premium problems
            if skip_premium and problem_meta.get('paidOnly'):
                continue
            
            title_slug = problem_meta['titleSlug']
            
            print(f"[{count + 1}/{limit}] Scraping: {problem_meta['title']}")
            
            problem = self.scrape_problem(title_slug)
            
            if problem:
                scraped.append(problem)
                count += 1
                
                # Show what we got
                print(f"         ✓ Description: {len(problem['description'])} chars")
                print(f"         ✓ Examples: {len(problem['examples'])}")
                print(f"         ✓ Constraints: {len(problem['constraints'])}")
                print(f"         ✓ Tags: {', '.join(problem['tags'][:3])}")
            
            # Be respectful - wait between requests
            time.sleep(1)
        
        print(f"\n{'='*80}")
        print(f"✅ Successfully scraped {len(scraped)} complete problems")
        print(f"{'='*80}\n")
        
        return scraped
    
    def save_to_file(self, problems, filename='leetcode_complete.json'):
        """Save to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(problems, f, indent=2, ensure_ascii=False)
            print(f"💾 Saved to {filename}")
        except Exception as e:
            print(f"❌ Error saving: {e}")
    
    def display_example(self, problem):
        """Display one problem as example"""
        print("\n" + "="*80)
        print("📋 EXAMPLE SCRAPED PROBLEM")
        print("="*80)
        print(f"\nTitle: {problem['title']}")
        print(f"Difficulty: {problem['difficulty']}")
        print(f"Tags: {', '.join(problem['tags'])}")
        print(f"URL: {problem['url']}")
        print(f"\nDescription ({len(problem['description'])} chars):")
        print(problem['description'][:300] + "..." if len(problem['description']) > 300 else problem['description'])
        
        print(f"\nExamples ({len(problem['examples'])}):")
        for i, ex in enumerate(problem['examples'][:2], 1):
            print(f"\n  Example {i}:")
            print(f"    Input: {ex.get('input', 'N/A')[:100]}")
            print(f"    Output: {ex.get('output', 'N/A')[:100]}")
            if 'explanation' in ex:
                print(f"    Explanation: {ex['explanation'][:100]}")
        
        print(f"\nConstraints ({len(problem['constraints'])}):")
        for constraint in problem['constraints'][:5]:
            print(f"  - {constraint}")
        
        print("\n" + "="*80)

def main():
    limit = 5
    
    if len(sys.argv) > 1:
        limit = int(sys.argv[1])
    
    scraper = LeetCodeCompleteScraper()
    problems = scraper.scrape_problems(limit=limit, skip_premium=True)
    
    if problems:
        # Show first problem as example
        scraper.display_example(problems[0])
        
        # Save all problems
        scraper.save_to_file(problems)
        
        print("\n" + "="*80)
        print("🎉 Scraping complete!")
        print(f"📊 Total problems scraped: {len(problems)}")
        print("📁 Check leetcode_complete.json for full data")
        print("="*80)
        print("\n⚠️  Note: This uses LeetCode's GraphQL API")
        print("   Use responsibly and respect their Terms of Service")
    else:
        print("\n❌ No problems were scraped")

if __name__ == "__main__":
    main()

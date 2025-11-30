import sys
sys.path.insert(0, 'backend/scripts')
from scrape_codeforces import CodeforcesScraper

scraper = CodeforcesScraper()
problems = scraper.scrape_problems(limit=5)
scraper.display_summary(problems)
scraper.save_to_file(problems, 'codeforces_problems.json')

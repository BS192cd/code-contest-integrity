import requests
import json

url = "https://leetcode.com/graphql"

query = """
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
  ) {
    questions: data {
      difficulty
      frontendQuestionId: questionFrontendId
      title
      titleSlug
      acRate
      paidOnly: isPaidOnly
    }
  }
}
"""

variables = {"categorySlug": "", "limit": 5, "skip": 0}

try:
    response = requests.post(
        url,
        json={"query": query, "variables": variables},
        headers={
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com/problemset/all/"
        },
        timeout=10
    )
    
    data = response.json()
    print(json.dumps(data, indent=2))
    
except Exception as e:
    print(f"Error: {e}")

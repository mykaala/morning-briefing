import os
import requests
from dotenv import load_dotenv

load_dotenv()


def get_news_headlines():
    """Fetch today's top 5 news headlines using the News API."""
    api_key = os.getenv("NEWS_API_KEY")

    if not api_key:
        raise ValueError("NEWS_API_KEY environment variable is required")

    url = "https://newsapi.org/v2/top-headlines"
    params = {
        "country": "us",
        "pageSize": 5,
        "apiKey": api_key
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()
    articles = data.get("articles", [])

    headlines = []
    for article in articles:
        headlines.append({
            "title": article["title"],
            "source": article["source"]["name"],
            "url": article["url"],
            "published_at": article["publishedAt"]
        })

    return headlines


if __name__ == "__main__":
    result = get_news_headlines()
    for headline in result:
        print(headline)

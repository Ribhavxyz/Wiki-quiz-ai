import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException
from utils.text_cleaner import clean_wikipedia_text


def scrape_wikipedia(url: str):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Wikipedia page not found")

        raw_html = response.text
        soup = BeautifulSoup(raw_html, "html.parser")

        # Extract title
        title_tag = soup.find("h1")
        title = title_tag.text.strip() if title_tag else "No title found"

        # Extract summary (first paragraph)
        paragraphs = soup.find_all("p")
        summary = ""
        for p in paragraphs:
            if p.text.strip():
                summary = p.text.strip()
                break

        # Extract section headings
        headings = []
        for h2 in soup.find_all("h2"):
            heading_text = h2.text.replace("[edit]", "").strip()
            if heading_text:
                headings.append(heading_text)

        # Extract cleaned text (all paragraphs)
        full_text = "\n".join([p.text.strip() for p in paragraphs if p.text.strip()])

        cleaned_text = clean_wikipedia_text(full_text)
        return {
            "title": title,
            "summary": summary,
            "sections": headings,
            "cleaned_text": cleaned_text,
            "raw_html": raw_html,
        }

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=408, detail="Request timed out")

    except requests.exceptions.RequestException:
        raise HTTPException(status_code=500, detail="Failed to fetch Wikipedia page")

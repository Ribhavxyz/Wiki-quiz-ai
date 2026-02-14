from urllib.parse import urlparse
from fastapi import HTTPException


def validate_wikipedia_url(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Invalid URL scheme")

    if "wikipedia.org" not in parsed.netloc:
        raise HTTPException(status_code=400, detail="Only Wikipedia URLs are allowed")

    return True

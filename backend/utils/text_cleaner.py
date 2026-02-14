import re

def clean_wikipedia_text(text: str, max_length: int = 5000):
    # Remove references like [1], [2], etc.
    text = re.sub(r"\[\d+\]", "", text)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Truncate to max_length characters
    if len(text) > max_length:
        text = text[:max_length] + "..."

    return text
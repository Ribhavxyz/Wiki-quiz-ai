import re

def remove_citations(text: str) -> str:
    """
    Remove Wikipedia-style numeric citations like [1], [23], [4][5]
    """
    return re.sub(r"\[\d+\]", "", text)


def clean_wikipedia_text(text: str, max_length: int = 5000) -> str:
    """
    Clean Wikipedia text:
    - Remove citations
    - Remove extra whitespace
    - Truncate to max_length
    """
    # Remove citations
    text = remove_citations(text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Truncate long content
    if len(text) > max_length:
        text = text[:max_length] + "..."

    return text

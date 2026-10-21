import re
import string
import nltk

# Download NLTK stopwords if not available
try:
    from nltk.corpus import stopwords
    stop_words = set(stopwords.words('english'))
except Exception:
    nltk.download('stopwords', quiet=True)
    try:
        from nltk.corpus import stopwords
        stop_words = set(stopwords.words('english'))
    except Exception:
        stop_words = {"the", "a", "an", "is", "it", "this", "that", "to", "in", "on", "of", "and", "or", "for", "with", "as"}

def clean_text(text: str, remove_stopwords: bool = False) -> str:
    """
    Cleans feedback text by removing URLs, HTML tags, extra whitespace,
    lowercasing, and optionally removing stop words.
    """
    if not text:
        return ""

    # Convert to string and lowercase
    cleaned = str(text).strip()
    
    # Remove HTML tags
    cleaned = re.sub(r'<[^>]+>', ' ', cleaned)
    
    # Remove URLs
    cleaned = re.sub(r'http\S+|www\.\S+', ' ', cleaned)
    
    # Remove email addresses
    cleaned = re.sub(r'\S+@\S+', ' ', cleaned)

    # Normalize multiple spaces and newlines
    cleaned = re.sub(r'\s+', ' ', cleaned)

    if remove_stopwords:
        tokens = cleaned.split()
        tokens = [w for w in tokens if w.lower() not in stop_words]
        cleaned = " ".join(tokens)

    return cleaned.strip()

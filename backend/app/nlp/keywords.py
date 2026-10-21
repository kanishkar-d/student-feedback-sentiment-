import re
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from app.nlp.cleaner import clean_text

DEFAULT_STOPWORDS = {
    "the", "a", "an", "is", "was", "are", "were", "it", "this", "that", "to", "in", "on", 
    "of", "and", "or", "for", "with", "as", "by", "at", "from", "be", "been", "have", 
    "has", "had", "do", "does", "did", "but", "not", "no", "can", "could", "will", "would",
    "should", "my", "your", "his", "her", "their", "our", "very", "much", "more", "also", "so"
}

def extract_keywords(text: str, top_n: int = 5) -> List[str]:
    """
    Extracts top keywords or keyphrases from feedback text.
    """
    if not text or len(text.strip()) < 5:
        return []

    cleaned = clean_text(text)
    words = [w for w in re.findall(r'\b[a-zA-Z]{3,}\b', cleaned.lower()) if w not in DEFAULT_STOPWORDS]

    if not words:
        return []

    try:
        # Use TfidfVectorizer on single document with character/ngram range
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', max_features=20)
        tfidf_matrix = vectorizer.fit_transform([cleaned])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]

        word_score = list(zip(feature_names, scores))
        word_score.sort(key=lambda x: x[1], reverse=True)

        return [word for word, score in word_score[:top_n]]
    except Exception:
        # Fallback to frequency count
        freq = {}
        for w in words:
            freq[w] = freq.get(w, 0) + 1
        sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [w[0] for w in sorted_words[:top_n]]

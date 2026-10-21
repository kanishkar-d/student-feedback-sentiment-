import logging
from typing import Dict, Any
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)

# Initialize VADER Analyzer
vader_analyzer = SentimentIntensityAnalyzer()

# Lazy loading for HuggingFace Transformers pipeline
_transformer_pipeline = None
_transformer_attempted = False

def get_transformer_pipeline():
    global _transformer_pipeline, _transformer_attempted
    if _transformer_pipeline is not None:
        return _transformer_pipeline
    if _transformer_attempted:
        return None

    _transformer_attempted = True
    try:
        from transformers import pipeline
        # Load HuggingFace sentiment pipeline (cardiffnlp twitter roberta sentiment)
        logger.info("Attempting to load HuggingFace transformer sentiment model...")
        _transformer_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            top_k=None,
            truncation=True,
            max_length=512
        )
        logger.info("Successfully loaded Transformer model.")
        return _transformer_pipeline
    except Exception as e:
        logger.warning(f"Could not load HuggingFace transformer model ({e}). Fallback to VADER sentiment analyzer.")
        _transformer_pipeline = None
        return None

def analyze_sentiment_vader(text: str) -> Dict[str, Any]:
    """
    VADER Sentiment Analysis Fallback
    """
    scores = vader_analyzer.polarity_scores(text)
    compound = scores['compound']
    pos = scores['pos']
    neu = scores['neu']
    neg = scores['neg']

    if compound >= 0.05:
        sentiment = "Positive"
        confidence = min(1.0, 0.5 + compound * 0.5)
    elif compound <= -0.05:
        sentiment = "Negative"
        confidence = min(1.0, 0.5 + abs(compound) * 0.5)
    else:
        sentiment = "Neutral"
        confidence = max(0.5, neu)

    return {
        "sentiment": sentiment,
        "confidence": round(float(confidence), 4),
        "pos_score": round(float(pos), 4),
        "neu_score": round(float(neu), 4),
        "neg_score": round(float(neg), 4),
        "model_used": "VADER (Rule-based Fallback)"
    }

def analyze_sentiment_transformer(text: str, pipe) -> Dict[str, Any]:
    """
    HuggingFace RoBERTa / Transformer Sentiment Analysis
    """
    # Pipe returns list of label-score dicts, e.g. [{'label': 'positive', 'score': 0.95}, ...]
    outputs = pipe(text)[0]
    
    # Map labels (roberta latest uses 'positive', 'neutral', 'negative')
    scores_map = {"positive": 0.0, "neutral": 0.0, "negative": 0.0}
    for item in outputs:
        label = item['label'].lower()
        if 'pos' in label:
            scores_map['positive'] = item['score']
        elif 'neu' in label:
            scores_map['neutral'] = item['score']
        elif 'neg' in label:
            scores_map['negative'] = item['score']

    pos = scores_map['positive']
    neu = scores_map['neutral']
    neg = scores_map['negative']

    # Determine winning label
    if pos >= neu and pos >= neg:
        sentiment = "Positive"
        confidence = pos
    elif neg >= pos and neg >= neu:
        sentiment = "Negative"
        confidence = neg
    else:
        sentiment = "Neutral"
        confidence = neu

    return {
        "sentiment": sentiment,
        "confidence": round(float(confidence), 4),
        "pos_score": round(float(pos), 4),
        "neu_score": round(float(neu), 4),
        "neg_score": round(float(neg), 4),
        "model_used": "RoBERTa (Transformer)"
    }

def predict_sentiment(text: str, force_model: str = None) -> Dict[str, Any]:
    """
    Main sentiment prediction function.
    Supports force_model="vader" or force_model="roberta"
    Defaults to RoBERTa with automatic VADER fallback.
    """
    text_str = str(text).strip()
    if not text_str:
        return {
            "sentiment": "Neutral",
            "confidence": 0.5,
            "pos_score": 0.33,
            "neu_score": 0.34,
            "neg_score": 0.33,
            "model_used": "Default (Empty Text)"
        }

    if force_model == "vader":
        return analyze_sentiment_vader(text_str)

    pipe = get_transformer_pipeline()
    if pipe is not None and force_model != "vader":
        try:
            return analyze_sentiment_transformer(text_str, pipe)
        except Exception as e:
            logger.warning(f"Error during transformer inference: {e}. Falling back to VADER.")
            return analyze_sentiment_vader(text_str)
    else:
        return analyze_sentiment_vader(text_str)

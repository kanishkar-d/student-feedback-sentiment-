import pytest
from app.nlp.cleaner import clean_text
from app.nlp.sentiment import predict_sentiment
from app.nlp.aspect import extract_aspects
from app.nlp.keywords import extract_keywords

def test_clean_text():
    raw = "Check out <p>this course</p> at http://example.com! Very good."
    cleaned = clean_text(raw)
    assert "<p>" not in cleaned
    assert "http" not in cleaned
    assert "Very good" in cleaned

def test_predict_sentiment_vader():
    res = predict_sentiment("The instructor is amazing and lectures are crystal clear!", force_model="vader")
    assert res["sentiment"] == "Positive"
    assert res["confidence"] > 0.5
    assert "VADER" in res["model_used"]

def test_predict_sentiment_negative():
    res = predict_sentiment("The exams were completely unfair and communication was awful.", force_model="vader")
    assert res["sentiment"] == "Negative"
    assert res["neg_score"] > 0.0

def test_aspect_extraction():
    text = "The teaching quality was fantastic, but the assignments were way too long."
    aspects = extract_aspects(text)
    categories = [a["aspect_category"] for a in aspects]
    assert "Teaching Quality" in categories
    assert "Assignments" in categories

def test_extract_keywords():
    text = "Machine learning neural networks deep learning artificial intelligence algorithms."
    keywords = extract_keywords(text, top_n=3)
    assert len(keywords) > 0

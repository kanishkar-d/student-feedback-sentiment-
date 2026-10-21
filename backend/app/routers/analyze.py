from fastapi import APIRouter
from app.schemas.schemas import AnalyzeRequest, AnalyzeResponse
from app.nlp.cleaner import clean_text
from app.nlp.sentiment import predict_sentiment
from app.nlp.aspect import extract_aspects
from app.nlp.keywords import extract_keywords

router = APIRouter(tags=["NLP Live Analyzer"])

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_text(request: AnalyzeRequest):
    raw_text = request.text.strip()
    cleaned = clean_text(raw_text)
    
    sent_res = predict_sentiment(cleaned, force_model=request.force_model)
    aspects = extract_aspects(cleaned)
    keywords = extract_keywords(cleaned, top_n=6)

    return AnalyzeResponse(
        raw_text=raw_text,
        cleaned_text=cleaned,
        sentiment=sent_res["sentiment"],
        confidence=sent_res["confidence"],
        pos_score=sent_res["pos_score"],
        neu_score=sent_res["neu_score"],
        neg_score=sent_res["neg_score"],
        model_used=sent_res["model_used"],
        aspects=[
            {
                "aspect_category": a["aspect_category"],
                "aspect_sentiment": a["aspect_sentiment"],
                "score": a["score"],
                "key_phrases": a.get("key_phrases", "")
            } for a in aspects
        ],
        keywords=keywords
    )

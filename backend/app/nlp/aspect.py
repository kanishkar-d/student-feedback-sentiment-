import re
from typing import List, Dict, Any
from app.nlp.sentiment import predict_sentiment

ASPECT_KEYWORDS = {
    "Teaching Quality": [
        "teach", "teaching", "teacher", "professor", "faculty", "explanation", "explain", 
        "lecture", "pedagogy", "understanding", "clarity", "style", "method", "instructor", "knowledgeable"
    ],
    "Course Content": [
        "content", "curriculum", "syllabus", "topic", "material", "subject", "concept", 
        "course", "module", "depth", "relevance", "outdated", "updated", "theory", "structure"
    ],
    "Assignments": [
        "assignment", "homework", "project", "submission", "deadline", "task", "workload", 
        "grading", "rubric", "feedback", "practical", "case study", "exercise"
    ],
    "Exams": [
        "exam", "examination", "test", "quiz", "midterm", "final", "grading", "question", 
        "paper", "marks", "score", "difficulty", "fair", "unfair", "assessment"
    ],
    "Lab/Facilities": [
        "lab", "laboratory", "equipment", "software", "hardware", "computer", "system", 
        "facility", "projector", "wifi", "internet", "resources", "tool", "classroom"
    ],
    "Communication": [
        "communication", "interact", "response", "reply", "email", "doubt", "answer", 
        "approachable", "discussion", "clear", "friendly", "behavior", "attitude"
    ],
    "Punctuality": [
        "time", "punctual", "punctuality", "late", "schedule", "timing", "class time", 
        "duration", "regular", "delay", "on time", "attendance"
    ],
    "Support": [
        "help", "support", "guidance", "mentorship", "office hours", "doubt clearing", 
        "assist", "encouraging", "cooperative", "extra time", "remedial"
    ]
}

def extract_aspects(text: str) -> List[Dict[str, Any]]:
    """
    Extracts aspect categories and calculates sentiment for each aspect mentioned in text.
    """
    if not text:
        return []

    # Split into sentences or clauses by punctuation and conjunctions
    clauses = [c.strip() for c in re.split(r'[\.!\?;\n]+|,\s*(?:but|and|however|although)\s*', text) if c.strip()]
    text_lower = text.lower()

    detected_aspects = []

    for aspect_category, keywords in ASPECT_KEYWORDS.items():
        # Check if any keyword matches
        matching_clauses = []
        key_phrases = []

        for kw in keywords:
            # Word boundary search with optional plural suffix
            pattern = r'\b' + re.escape(kw) + r'(?:s|es)?\b'
            if re.search(pattern, text_lower):
                key_phrases.append(kw)
                for clause in clauses:
                    if re.search(pattern, clause.lower()):
                        matching_clauses.append(clause.strip())

        if key_phrases:
            # Deduplicate matching clauses
            matching_clauses = list(set(matching_clauses))
            phrase_text = " ".join(matching_clauses) if matching_clauses else text

            # Run sentiment prediction on the specific clause(s)
            sent_res = predict_sentiment(phrase_text, force_model="vader")
            
            score = sent_res["pos_score"] - sent_res["neg_score"]
            aspect_sentiment = sent_res["sentiment"]

            detected_aspects.append({
                "aspect_category": aspect_category,
                "aspect_sentiment": aspect_sentiment,
                "score": round(float(score), 4),
                "key_phrases": ", ".join(sorted(set(key_phrases))[:5])
            })

    # Default fallback aspect if no specific keywords triggered
    if not detected_aspects:
        overall_sent = predict_sentiment(text, force_model="vader")
        detected_aspects.append({
            "aspect_category": "Teaching Quality",
            "aspect_sentiment": overall_sent["sentiment"],
            "score": round(float(overall_sent["pos_score"] - overall_sent["neg_score"]), 4),
            "key_phrases": "overall feedback"
        })

    return detected_aspects

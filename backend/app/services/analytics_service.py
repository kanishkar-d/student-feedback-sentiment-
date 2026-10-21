import json
from typing import List, Dict, Any, Optional
from collections import Counter
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import Feedback, SentimentResult, AspectResult, User, Course, Department, UserRole

def get_overview_analytics(db: Session, faculty_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Computes global or faculty-scoped overview KPI metrics.
    """
    query = db.query(Feedback).join(SentimentResult)
    if faculty_id:
        query = query.filter(Feedback.faculty_id == faculty_id)

    total_feedback = query.count()
    if total_feedback == 0:
        return {
            "total_feedback": 0,
            "positive_count": 0,
            "neutral_count": 0,
            "negative_count": 0,
            "positive_percentage": 0.0,
            "average_rating": 0.0,
            "active_courses": 0,
            "active_faculty": 0
        }

    positive_count = query.filter(SentimentResult.sentiment == "Positive").count()
    neutral_count = query.filter(SentimentResult.sentiment == "Neutral").count()
    negative_count = query.filter(SentimentResult.sentiment == "Negative").count()

    positive_percentage = round((positive_count / total_feedback) * 100, 1)

    avg_rating_res = db.query(func.avg(Feedback.rating)).filter(
        Feedback.faculty_id == faculty_id if faculty_id else True
    ).scalar()
    avg_rating = round(float(avg_rating_res or 0.0), 2)

    active_courses = db.query(func.count(func.distinct(Feedback.course_id))).filter(
        Feedback.faculty_id == faculty_id if faculty_id else True
    ).scalar() or 0

    active_faculty = 1 if faculty_id else (db.query(func.count(func.distinct(Feedback.faculty_id))).scalar() or 0)

    return {
        "total_feedback": total_feedback,
        "positive_count": positive_count,
        "neutral_count": neutral_count,
        "negative_count": negative_count,
        "positive_percentage": positive_percentage,
        "average_rating": avg_rating,
        "active_courses": active_courses,
        "active_faculty": active_faculty
    }

def get_trend_analytics(db: Session, faculty_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Generates sentiment trend time-series data grouped by date.
    """
    query = db.query(
        func.strftime('%Y-%m-%d', Feedback.created_at).label('date'),
        SentimentResult.sentiment,
        func.count(Feedback.id).label('count'),
        func.avg(Feedback.rating).label('avg_rating')
    ).join(SentimentResult)

    if faculty_id:
        query = query.filter(Feedback.faculty_id == faculty_id)

    results = query.group_by('date', SentimentResult.sentiment).order_by('date').all()

    # Aggregate by date
    trends_map = {}
    for date_str, sentiment, count, avg_r in results:
        if date_str not in trends_map:
            trends_map[date_str] = {"date": date_str, "positive": 0, "neutral": 0, "negative": 0, "ratings": []}
        
        if sentiment == "Positive":
            trends_map[date_str]["positive"] += count
        elif sentiment == "Neutral":
            trends_map[date_str]["neutral"] += count
        elif sentiment == "Negative":
            trends_map[date_str]["negative"] += count
            
        trends_map[date_str]["ratings"].append(float(avg_r or 0))

    trend_list = []
    for d in sorted(trends_map.keys()):
        item = trends_map[d]
        avg_rating = sum(item["ratings"]) / len(item["ratings"]) if item["ratings"] else 0.0
        trend_list.append({
            "date": item["date"],
            "positive": item["positive"],
            "neutral": item["neutral"],
            "negative": item["negative"],
            "avg_rating": round(avg_rating, 2)
        })

    return trend_list

def generate_ai_summary(pos_aspects: List[str], neg_aspects: List[str], pos_pct: float, avg_rating: float) -> str:
    """
    Auto-generates plain-English narrative summary for faculty / course performance.
    """
    if not pos_aspects and not neg_aspects:
        return "Insufficient feedback data available to generate an AI summary."

    pos_str = ", ".join(pos_aspects[:2]) if pos_aspects else "overall approach"
    neg_str = ", ".join(neg_aspects[:2]) if neg_aspects else "minor areas"

    if pos_pct >= 75.0:
        return f"Students demonstrate high satisfaction ({pos_pct}% positive, {avg_rating}/5.0 stars). They strongly praise the {pos_str}. Minor constructive notes highlight {neg_str}."
    elif pos_pct >= 50.0:
        return f"Overall feedback is balanced with a positive tilt ({pos_pct}% positive, {avg_rating}/5.0 stars). Students appreciate {pos_str}, while frequently recommending improvements in {neg_str}."
    else:
        return f"Feedback indicates notable student concern ({pos_pct}% positive, {avg_rating}/5.0 stars). Although students value {pos_str}, immediate attention is recommended for {neg_str}."

def get_faculty_analytics(db: Session) -> List[Dict[str, Any]]:
    """
    Computes per-faculty analytics with rankings and AI summary.
    """
    faculty_users = db.query(User).filter(User.role == UserRole.FACULTY).all()
    results = []

    for fac in faculty_users:
        dept_name = fac.department.name if fac.department else "General"
        feedbacks = db.query(Feedback).filter(Feedback.faculty_id == fac.id).all()
        total = len(feedbacks)
        if total == 0:
            results.append({
                "faculty_id": fac.id,
                "faculty_name": fac.full_name,
                "department_name": dept_name,
                "total_feedback": 0,
                "positive_count": 0,
                "neutral_count": 0,
                "negative_count": 0,
                "avg_rating": 0.0,
                "ai_summary": "No student feedback has been submitted yet for this faculty member."
            })
            continue

        pos_c = 0
        neu_c = 0
        neg_c = 0
        ratings = []

        for f in feedbacks:
            ratings.append(f.rating)
            if f.sentiment_result:
                if f.sentiment_result.sentiment == "Positive":
                    pos_c += 1
                elif f.sentiment_result.sentiment == "Neutral":
                    neu_c += 1
                elif f.sentiment_result.sentiment == "Negative":
                    neg_c += 1

        avg_r = sum(ratings) / len(ratings) if ratings else 0.0
        pos_pct = round((pos_c / total) * 100, 1)

        # Get top positive and negative aspects
        aspects_q = db.query(AspectResult).join(Feedback).filter(Feedback.faculty_id == fac.id).all()
        pos_aspects = list(set([a.aspect_category for a in aspects_q if a.aspect_sentiment == "Positive"]))
        neg_aspects = list(set([a.aspect_category for a in aspects_q if a.aspect_sentiment == "Negative"]))

        ai_summary = generate_ai_summary(pos_aspects, neg_aspects, pos_pct, round(avg_r, 2))

        results.append({
            "faculty_id": fac.id,
            "faculty_name": fac.full_name,
            "department_name": dept_name,
            "total_feedback": total,
            "positive_count": pos_c,
            "neutral_count": neu_c,
            "negative_count": neg_c,
            "avg_rating": round(avg_r, 2),
            "ai_summary": ai_summary
        })

    results.sort(key=lambda x: (x["avg_rating"], x["total_feedback"]), reverse=True)
    return results

def get_course_analytics(db: Session) -> List[Dict[str, Any]]:
    """
    Computes per-course sentiment breakdown.
    """
    courses = db.query(Course).all()
    results = []

    for c in courses:
        feedbacks = db.query(Feedback).filter(Feedback.course_id == c.id).all()
        total = len(feedbacks)
        if total == 0:
            continue

        pos_c = 0
        neu_c = 0
        neg_c = 0
        ratings = []

        for f in feedbacks:
            ratings.append(f.rating)
            if f.sentiment_result:
                if f.sentiment_result.sentiment == "Positive":
                    pos_c += 1
                elif f.sentiment_result.sentiment == "Neutral":
                    neu_c += 1
                elif f.sentiment_result.sentiment == "Negative":
                    neg_c += 1

        avg_r = sum(ratings) / len(ratings) if ratings else 0.0

        results.append({
            "course_id": c.id,
            "course_code": c.code,
            "course_title": c.title,
            "total_feedback": total,
            "positive_count": pos_c,
            "neutral_count": neu_c,
            "negative_count": neg_c,
            "avg_rating": round(avg_r, 2)
        })

    results.sort(key=lambda x: x["total_feedback"], reverse=True)
    return results

def get_aspect_analytics(db: Session, faculty_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Computes sentiment distribution per aspect category for Radar and Bar charts.
    """
    query = db.query(AspectResult).join(Feedback)
    if faculty_id:
        query = query.filter(Feedback.faculty_id == faculty_id)

    aspect_records = query.all()
    aspect_map = {}

    for a in aspect_records:
        cat = a.aspect_category
        if cat not in aspect_map:
            aspect_map[cat] = {
                "aspect_category": cat,
                "total_mentions": 0,
                "positive_count": 0,
                "neutral_count": 0,
                "negative_count": 0,
                "scores": []
            }
        
        aspect_map[cat]["total_mentions"] += 1
        if a.aspect_sentiment == "Positive":
            aspect_map[cat]["positive_count"] += 1
        elif a.aspect_sentiment == "Neutral":
            aspect_map[cat]["neutral_count"] += 1
        elif a.aspect_sentiment == "Negative":
            aspect_map[cat]["negative_count"] += 1
            
        aspect_map[cat]["scores"].append(a.score)

    results = []
    for cat, data in aspect_map.items():
        total = data["total_mentions"]
        pos_pct = round((data["positive_count"] / total) * 100, 1) if total > 0 else 0.0
        avg_score = sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0.0

        results.append({
            "aspect_category": cat,
            "total_mentions": total,
            "positive_count": data["positive_count"],
            "neutral_count": data["neutral_count"],
            "negative_count": data["negative_count"],
            "pos_percentage": pos_pct,
            "avg_score": round(avg_score, 2)
        })

    results.sort(key=lambda x: x["total_mentions"], reverse=True)
    return results

def get_wordcloud_data(db: Session, faculty_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Aggregates keyword frequencies across feedback for Word Cloud visualization.
    """
    query = db.query(SentimentResult).join(Feedback)
    if faculty_id:
        query = query.filter(Feedback.faculty_id == faculty_id)

    sentiment_results = query.all()
    word_counter = Counter()
    word_sentiment_map = {}

    for sr in sentiment_results:
        if sr.keywords:
            try:
                kw_list = json.loads(sr.keywords)
                for kw in kw_list:
                    clean_kw = kw.strip().lower()
                    if len(clean_kw) >= 3:
                        word_counter[clean_kw] += 1
                        if clean_kw not in word_sentiment_map:
                            word_sentiment_map[clean_kw] = sr.sentiment
            except Exception:
                continue

    items = []
    for word, count in word_counter.most_common(50):
        items.append({
            "text": word,
            "value": count,
            "sentiment": word_sentiment_map.get(word, "Neutral")
        })

    return items

def get_strengths_and_improvements(db: Session, faculty_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Returns top 5 strengths and top 5 areas for improvement based on aspect analysis.
    """
    aspects = get_aspect_analytics(db, faculty_id=faculty_id)
    sorted_by_pos = sorted(aspects, key=lambda x: x["pos_percentage"], reverse=True)
    sorted_by_neg = sorted(aspects, key=lambda x: x["negative_count"], reverse=True)

    strengths = [
        f"{a['aspect_category']} ({a['pos_percentage']}% positive score)"
        for a in sorted_by_pos[:5] if a['pos_percentage'] > 0
    ]

    improvements = [
        f"{a['aspect_category']} ({a['negative_count']} critical comments)"
        for a in sorted_by_neg[:5] if a['negative_count'] > 0
    ]

    return {
        "top_strengths": strengths or ["Consistently positive teaching approach", "Active student engagement"],
        "top_improvements": improvements or ["More interactive lab sessions", "Timely assignment feedback"]
    }

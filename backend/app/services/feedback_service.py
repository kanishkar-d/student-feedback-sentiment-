import json
import csv
import io
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile

from app.models.models import Feedback, SentimentResult, AspectResult, User, Course, UploadLog, UserRole
from app.schemas.schemas import FeedbackCreate
from app.nlp.cleaner import clean_text
from app.nlp.sentiment import predict_sentiment
from app.nlp.aspect import extract_aspects
from app.nlp.keywords import extract_keywords

def create_feedback_entry(
    db: Session,
    feedback_in: FeedbackCreate,
    student_id: Optional[int] = None,
    force_model: Optional[str] = None
) -> Feedback:
    """
    Creates feedback, analyzes sentiment, extracts aspects and keywords, and persists to DB.
    """
    # Verify course & faculty exist
    course = db.query(Course).filter(Course.id == feedback_in.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course with ID {feedback_in.course_id} not found.")

    faculty = db.query(User).filter(User.id == feedback_in.faculty_id, User.role == UserRole.FACULTY).first()
    if not faculty:
        raise HTTPException(status_code=404, detail=f"Faculty user with ID {feedback_in.faculty_id} not found.")

    feedback = Feedback(
        student_id=student_id,
        course_id=feedback_in.course_id,
        faculty_id=feedback_in.faculty_id,
        rating=feedback_in.rating,
        raw_comment=feedback_in.raw_comment,
        is_anonymous=feedback_in.is_anonymous
    )
    db.add(feedback)
    db.flush()

    # NLP Analysis
    cleaned = clean_text(feedback_in.raw_comment)
    sent_res = predict_sentiment(cleaned, force_model=force_model)
    keywords = extract_keywords(cleaned, top_n=5)
    aspects = extract_aspects(cleaned)

    # Save Sentiment Result
    sentiment_entry = SentimentResult(
        feedback_id=feedback.id,
        sentiment=sent_res["sentiment"],
        confidence=sent_res["confidence"],
        pos_score=sent_res["pos_score"],
        neu_score=sent_res["neu_score"],
        neg_score=sent_res["neg_score"],
        model_used=sent_res["model_used"],
        cleaned_text=cleaned,
        keywords=json.dumps(keywords)
    )
    db.add(sentiment_entry)

    # Save Aspect Results
    for asp in aspects:
        asp_entry = AspectResult(
            feedback_id=feedback.id,
            aspect_category=asp["aspect_category"],
            aspect_sentiment=asp["aspect_sentiment"],
            score=asp["score"],
            key_phrases=asp.get("key_phrases", "")
        )
        db.add(asp_entry)

    db.commit()
    db.refresh(feedback)
    return feedback

def process_csv_upload(db: Session, file: UploadFile, admin_id: int) -> Dict[str, Any]:
    """
    Parses CSV and bulk uploads feedback records with automatic sentiment analysis.
    Expected CSV Columns: course_code, faculty_email, rating, comment, is_anonymous (optional)
    """
    content = file.file.read().decode('utf-8-sig')
    csv_reader = csv.DictReader(io.StringIO(content))

    total_rows = 0
    successful_rows = 0
    failed_rows = 0
    errors = []

    # Cache courses and faculty for fast lookup
    courses_map = {c.code.upper(): c.id for c in db.query(Course).all()}
    faculty_map = {u.email.lower(): u.id for u in db.query(User).filter(User.role == UserRole.FACULTY).all()}

    for row_idx, row in enumerate(csv_reader, start=1):
        total_rows += 1
        try:
            course_code = row.get("course_code", "").strip().upper()
            faculty_email = row.get("faculty_email", "").strip().lower()
            rating_str = row.get("rating", "3").strip()
            comment = row.get("comment", "").strip()
            is_anon_str = str(row.get("is_anonymous", "false")).strip().lower()
            is_anonymous = is_anon_str in ["true", "1", "yes"]

            if not course_code or course_code not in courses_map:
                errors.append(f"Row {row_idx}: Course code '{course_code}' invalid.")
                failed_rows += 1
                continue

            if not faculty_email or faculty_email not in faculty_map:
                errors.append(f"Row {row_idx}: Faculty email '{faculty_email}' invalid.")
                failed_rows += 1
                continue

            if not comment:
                errors.append(f"Row {row_idx}: Empty comment.")
                failed_rows += 1
                continue

            rating = int(rating_str)
            if rating < 1 or rating > 5:
                rating = 3

            feedback_in = FeedbackCreate(
                course_id=courses_map[course_code],
                faculty_id=faculty_map[faculty_email],
                rating=rating,
                raw_comment=comment,
                is_anonymous=is_anonymous
            )

            # Create entry (using VADER for speed during bulk upload)
            create_feedback_entry(db, feedback_in, student_id=None, force_model="vader")
            successful_rows += 1

        except Exception as e:
            failed_rows += 1
            errors.append(f"Row {row_idx}: {str(e)}")

    upload_log = UploadLog(
        filename=file.filename or "uploaded.csv",
        total_rows=total_rows,
        successful_rows=successful_rows,
        failed_rows=failed_rows,
        uploaded_by_id=admin_id,
        error_details="; ".join(errors[:10]) if errors else None
    )
    db.add(upload_log)
    db.commit()

    return {
        "filename": file.filename,
        "total_rows": total_rows,
        "successful_rows": successful_rows,
        "failed_rows": failed_rows,
        "error_details": "; ".join(errors[:10]) if errors else None
    }

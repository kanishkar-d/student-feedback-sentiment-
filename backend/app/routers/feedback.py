import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.models import User, Feedback, SentimentResult, UserRole, Course
from app.schemas.schemas import FeedbackCreate, FeedbackOut, UploadResponse
from app.services.feedback_service import create_feedback_entry, process_csv_upload

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student_id = None if feedback_in.is_anonymous else current_user.id
    feedback = create_feedback_entry(db, feedback_in, student_id=student_id)
    return format_feedback_out(feedback)

@router.get("", response_model=List[FeedbackOut])
def list_feedback(
    course_id: Optional[int] = Query(None),
    faculty_id: Optional[int] = Query(None),
    sentiment: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback).join(SentimentResult)

    # Faculty can only view feedback for their own courses
    if current_user.role == UserRole.FACULTY:
        query = query.filter(Feedback.faculty_id == current_user.id)
    elif faculty_id:
        query = query.filter(Feedback.faculty_id == faculty_id)

    # Student viewing own feedback history
    if current_user.role == UserRole.STUDENT:
        query = query.filter(Feedback.student_id == current_user.id)

    if course_id:
        query = query.filter(Feedback.course_id == course_id)
    if rating:
        query = query.filter(Feedback.rating == rating)
    if sentiment:
        query = query.filter(SentimentResult.sentiment == sentiment)

    feedbacks = query.order_by(desc(Feedback.created_at)).offset(skip).limit(limit).all()
    return [format_feedback_out(f) for f in feedbacks]

@router.get("/{feedback_id}", response_model=FeedbackOut)
def get_feedback_by_id(
    feedback_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback entry not found.")

    if current_user.role == UserRole.FACULTY and feedback.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    if current_user.role == UserRole.STUDENT and feedback.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    return format_feedback_out(feedback)

@router.post("/upload-csv", response_model=UploadResponse)
def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    return process_csv_upload(db, file, admin_id=current_user.id)

def format_feedback_out(f: Feedback) -> dict:
    keywords = []
    if f.sentiment_result and f.sentiment_result.keywords:
        try:
            keywords = json.loads(f.sentiment_result.keywords)
        except Exception:
            keywords = []

    return {
        "id": f.id,
        "course_id": f.course_id,
        "course_code": f.course.code if f.course else None,
        "course_title": f.course.title if f.course else None,
        "faculty_id": f.faculty_id,
        "faculty_name": f.faculty.full_name if f.faculty else None,
        "student_id": None if f.is_anonymous else f.student_id,
        "student_name": "Anonymous Student" if f.is_anonymous else (f.student.full_name if f.student else "Student"),
        "rating": f.rating,
        "raw_comment": f.raw_comment,
        "is_anonymous": f.is_anonymous,
        "created_at": f.created_at,
        "sentiment_result": {
            "sentiment": f.sentiment_result.sentiment,
            "confidence": f.sentiment_result.confidence,
            "pos_score": f.sentiment_result.pos_score,
            "neu_score": f.sentiment_result.neu_score,
            "neg_score": f.sentiment_result.neg_score,
            "model_used": f.sentiment_result.model_used,
            "cleaned_text": f.sentiment_result.cleaned_text,
            "keywords": keywords
        } if f.sentiment_result else None,
        "aspect_results": [
            {
                "aspect_category": a.aspect_category,
                "aspect_sentiment": a.aspect_sentiment,
                "score": a.score,
                "key_phrases": a.key_phrases
            } for a in f.aspect_results
        ]
    }

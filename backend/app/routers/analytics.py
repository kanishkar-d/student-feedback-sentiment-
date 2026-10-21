from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, UserRole
from app.schemas.schemas import (
    OverviewStats, TrendPoint, FacultyAnalytics, CourseAnalytics, AspectScore, WordCloudItem
)
from app.services.analytics_service import (
    get_overview_analytics, get_trend_analytics, get_faculty_analytics,
    get_course_analytics, get_aspect_analytics, get_wordcloud_data,
    get_strengths_and_improvements
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def resolve_faculty_id(current_user: User, requested_id: Optional[int]) -> Optional[int]:
    if current_user.role == UserRole.FACULTY:
        return current_user.id
    return requested_id

@router.get("/overview", response_model=OverviewStats)
def overview_stats(
    faculty_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_fac_id = resolve_faculty_id(current_user, faculty_id)
    return get_overview_analytics(db, faculty_id=target_fac_id)

@router.get("/trends", response_model=List[TrendPoint])
def trend_stats(
    faculty_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_fac_id = resolve_faculty_id(current_user, faculty_id)
    return get_trend_analytics(db, faculty_id=target_fac_id)

@router.get("/faculty", response_model=List[FacultyAnalytics])
def faculty_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_faculty_analytics(db)

@router.get("/courses", response_model=List[CourseAnalytics])
def course_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_course_analytics(db)

@router.get("/aspects", response_model=List[AspectScore])
def aspect_analytics(
    faculty_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_fac_id = resolve_faculty_id(current_user, faculty_id)
    return get_aspect_analytics(db, faculty_id=target_fac_id)

@router.get("/wordcloud", response_model=List[WordCloudItem])
def wordcloud_analytics(
    faculty_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_fac_id = resolve_faculty_id(current_user, faculty_id)
    return get_wordcloud_data(db, faculty_id=target_fac_id)

@router.get("/strengths")
def strengths_and_improvements(
    faculty_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_fac_id = resolve_faculty_id(current_user, faculty_id)
    return get_strengths_and_improvements(db, faculty_id=target_fac_id)

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole

# Auth & User Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: UserRole = UserRole.STUDENT
    department_id: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Course Schemas
class CourseBase(BaseModel):
    code: str
    title: str
    department_id: int

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: int
    department_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Faculty Course Mapping
class FacultyCourseCreate(BaseModel):
    faculty_id: int
    course_id: int
    semester: str
    year: int

class FacultyCourseOut(BaseModel):
    id: int
    faculty_id: int
    faculty_name: str
    course_id: int
    course_code: str
    course_title: str
    semester: str
    year: int

    model_config = ConfigDict(from_attributes=True)

# Aspect Result Schema
class AspectResultOut(BaseModel):
    aspect_category: str
    aspect_sentiment: str
    score: float
    key_phrases: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Sentiment Result Schema
class SentimentResultOut(BaseModel):
    sentiment: str
    confidence: float
    pos_score: float
    neu_score: float
    neg_score: float
    model_used: str
    cleaned_text: Optional[str] = None
    keywords: Optional[List[str]] = []

    model_config = ConfigDict(from_attributes=True)

# Feedback Schemas
class FeedbackCreate(BaseModel):
    course_id: int
    faculty_id: int
    rating: int = Field(..., ge=1, le=5)
    raw_comment: str = Field(..., min_length=3)
    is_anonymous: bool = False

class FeedbackOut(BaseModel):
    id: int
    course_id: int
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    faculty_id: int
    faculty_name: Optional[str] = None
    student_id: Optional[int] = None
    student_name: Optional[str] = None
    rating: int
    raw_comment: str
    is_anonymous: bool
    created_at: datetime
    sentiment_result: Optional[SentimentResultOut] = None
    aspect_results: Optional[List[AspectResultOut]] = []

    model_config = ConfigDict(from_attributes=True)

# Live Analyzer Schema
class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=2)
    force_model: Optional[str] = None  # None, "roberta", "vader"

class AnalyzeResponse(BaseModel):
    raw_text: str
    cleaned_text: str
    sentiment: str
    confidence: float
    pos_score: float
    neu_score: float
    neg_score: float
    model_used: str
    aspects: List[AspectResultOut]
    keywords: List[str]

# Upload Schema
class UploadResponse(BaseModel):
    filename: str
    total_rows: int
    successful_rows: int
    failed_rows: int
    error_details: Optional[str] = None

# Analytics Schemas
class OverviewStats(BaseModel):
    total_feedback: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_percentage: float
    average_rating: float
    active_courses: int
    active_faculty: int

class TrendPoint(BaseModel):
    date: str
    positive: int
    neutral: int
    negative: int
    avg_rating: float

class FacultyAnalytics(BaseModel):
    faculty_id: int
    faculty_name: str
    department_name: Optional[str] = ""
    total_feedback: int
    positive_count: int
    neutral_count: int
    negative_count: int
    avg_rating: float
    ai_summary: str

class CourseAnalytics(BaseModel):
    course_id: int
    course_code: str
    course_title: str
    total_feedback: int
    positive_count: int
    neutral_count: int
    negative_count: int
    avg_rating: float

class AspectScore(BaseModel):
    aspect_category: str
    total_mentions: int
    positive_count: int
    neutral_count: int
    negative_count: int
    pos_percentage: float
    avg_score: float

class WordCloudItem(BaseModel):
    text: str
    value: int
    sentiment: str

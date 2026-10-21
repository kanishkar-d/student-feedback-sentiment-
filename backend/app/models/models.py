import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    department = relationship("Department", back_populates="users")
    feedbacks_submitted = relationship("Feedback", foreign_keys="Feedback.student_id", back_populates="student")
    feedbacks_received = relationship("Feedback", foreign_keys="Feedback.faculty_id", back_populates="faculty")
    faculty_courses = relationship("FacultyCourse", back_populates="faculty")
    uploads = relationship("UploadLog", back_populates="uploaded_by")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="department")
    courses = relationship("Course", back_populates="department")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    department = relationship("Department", back_populates="courses")
    feedbacks = relationship("Feedback", back_populates="course")
    faculty_courses = relationship("FacultyCourse", back_populates="course")

class FacultyCourse(Base):
    __tablename__ = "faculty_courses"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    semester = Column(String, nullable=False)
    year = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    faculty = relationship("User", back_populates="faculty_courses")
    course = relationship("Course", back_populates="faculty_courses")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    raw_comment = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    student = relationship("User", foreign_keys=[student_id], back_populates="feedbacks_submitted")
    faculty = relationship("User", foreign_keys=[faculty_id], back_populates="feedbacks_received")
    course = relationship("Course", back_populates="feedbacks")
    sentiment_result = relationship("SentimentResult", back_populates="feedback", uselist=False, cascade="all, delete-orphan")
    aspect_results = relationship("AspectResult", back_populates="feedback", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_feedback_course_faculty_date', 'course_id', 'faculty_id', 'created_at'),
    )

class SentimentResult(Base):
    __tablename__ = "sentiment_results"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"), unique=True, index=True, nullable=False)
    sentiment = Column(String, nullable=False)  # Positive, Neutral, Negative
    confidence = Column(Float, nullable=False)
    pos_score = Column(Float, default=0.0, nullable=False)
    neu_score = Column(Float, default=0.0, nullable=False)
    neg_score = Column(Float, default=0.0, nullable=False)
    model_used = Column(String, nullable=False)  # RoBERTa, VADER, DistilBERT
    cleaned_text = Column(Text, nullable=True)
    keywords = Column(Text, nullable=True)  # JSON string of extracted keywords

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    feedback = relationship("Feedback", back_populates="sentiment_result")

class AspectResult(Base):
    __tablename__ = "aspect_results"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"), index=True, nullable=False)
    aspect_category = Column(String, nullable=False, index=True)  # e.g., Teaching Quality
    aspect_sentiment = Column(String, nullable=False)  # Positive, Neutral, Negative
    score = Column(Float, default=0.0, nullable=False)
    key_phrases = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    feedback = relationship("Feedback", back_populates="aspect_results")

class UploadLog(Base):
    __tablename__ = "upload_logs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    total_rows = Column(Integer, nullable=False)
    successful_rows = Column(Integer, nullable=False)
    failed_rows = Column(Integer, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    error_details = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    uploaded_by = relationship("User", back_populates="uploads")

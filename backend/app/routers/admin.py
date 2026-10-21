from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.models import User, Department, Course, FacultyCourse, Feedback, UserRole
from app.schemas.schemas import (
    UserOut, DepartmentOut, DepartmentCreate, CourseOut, CourseCreate,
    FacultyCourseOut, FacultyCourseCreate
)

router = APIRouter(prefix="/admin", tags=["Admin Management"])

# Enforce Admin Role across all routes in this router
admin_guard = require_roles([UserRole.ADMIN])

# User Management
@router.get("/users", response_model=List[UserOut], dependencies=[Depends(admin_guard)])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    out = []
    for u in users:
        dept_name = u.department.name if u.department else None
        out.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "department_id": u.department_id,
            "department_name": dept_name,
            "created_at": u.created_at
        })
    return out

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_guard)])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    db.delete(user)
    db.commit()

# Department Management
@router.get("/departments", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.post("/departments", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_guard)])
def create_department(dept_in: DepartmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Department).filter(
        (Department.code == dept_in.code.upper()) | (Department.name == dept_in.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this code or name already exists.")

    dept = Department(
        name=dept_in.name,
        code=dept_in.code.upper(),
        description=dept_in.description
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

# Course Management
@router.get("/courses", response_model=List[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    out = []
    for c in courses:
        out.append({
            "id": c.id,
            "code": c.code,
            "title": c.title,
            "department_id": c.department_id,
            "department_name": c.department.name if c.department else None,
            "created_at": c.created_at
        })
    return out

@router.post("/courses", response_model=CourseOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_guard)])
def create_course(course_in: CourseCreate, db: Session = Depends(get_db)):
    existing = db.query(Course).filter(Course.code == course_in.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course with this code already exists.")

    course = Course(
        code=course_in.code.upper(),
        title=course_in.title,
        department_id=course_in.department_id
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    
    return {
        "id": course.id,
        "code": course.code,
        "title": course.title,
        "department_id": course.department_id,
        "department_name": course.department.name if course.department else None,
        "created_at": course.created_at
    }

# Faculty-Course Assignment
@router.get("/faculty-courses", response_model=List[FacultyCourseOut], dependencies=[Depends(admin_guard)])
def list_faculty_courses(db: Session = Depends(get_db)):
    mappings = db.query(FacultyCourse).all()
    out = []
    for m in mappings:
        out.append({
            "id": m.id,
            "faculty_id": m.faculty_id,
            "faculty_name": m.faculty.full_name if m.faculty else "Unknown",
            "course_id": m.course_id,
            "course_code": m.course.code if m.course else "Unknown",
            "course_title": m.course.title if m.course else "Unknown",
            "semester": m.semester,
            "year": m.year
        })
    return out

@router.post("/faculty-courses", response_model=FacultyCourseOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_guard)])
def assign_faculty_course(mapping_in: FacultyCourseCreate, db: Session = Depends(get_db)):
    fc = FacultyCourse(
        faculty_id=mapping_in.faculty_id,
        course_id=mapping_in.course_id,
        semester=mapping_in.semester,
        year=mapping_in.year
    )
    db.add(fc)
    db.commit()
    db.refresh(fc)
    return {
        "id": fc.id,
        "faculty_id": fc.faculty_id,
        "faculty_name": fc.faculty.full_name if fc.faculty else "Unknown",
        "course_id": fc.course_id,
        "course_code": fc.course.code if fc.course else "Unknown",
        "course_title": fc.course.title if fc.course else "Unknown",
        "semester": fc.semester,
        "year": fc.year
    }

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import (
    User, Department, Course, FacultyCourse, Feedback, UserRole
)
from app.schemas.schemas import FeedbackCreate
from app.services.feedback_service import create_feedback_entry

# Create tables
Base.metadata.create_all(bind=engine)

REALISTIC_POSITIVE_COMMENTS = [
    "Dr. Smith is an outstanding professor! Her explanations of data structures are extremely clear and easy to grasp.",
    "The course content is incredibly well-structured. The hands-on coding assignments helped me understand neural networks deeply.",
    "Loved the lab sessions! The lab assistant and faculty were always available to clarify doubts during office hours.",
    "Exams were fair and directly tested the concepts taught in lectures. Graded feedback was returned very promptly.",
    "Great communication throughout the semester. The instructor responds to emails within an hour and encourages questions.",
    "Assignments were challenging but fun. They gave real-world problem-solving experience.",
    "Always punctual and passionate about teaching. Highly recommend taking this course with Prof. Davis!",
    "The lectures are super engaging. Complex theoretical topics are broken down with intuitive real-world examples.",
    "Fantastic support provided before final exams. The revision classes cleared all my doubts.",
    "The syllabus is modern and covers state-of-the-art tools and frameworks. Really enjoyed this semester.",
    "Excellent guidance on the final semester project. The mentorship received was top notch!",
    "The professor created a very welcoming classroom environment where every student felt comfortable participating.",
    "Clear rubrics were provided for all projects. No confusion about expectations or grading criteria.",
    "Punctual, organized, and deeply knowledgeable. One of the best courses I've taken at this university.",
    "The interactive quizzes after each module made learning regular and stress-free."
]

REALISTIC_NEUTRAL_COMMENTS = [
    "The course content is decent, but the pacing was a bit fast towards the mid-semester exams.",
    "Good lectures, though I wish there were more practical demonstrations during lab hours.",
    "Assignments were okay. Some question prompts were slightly ambiguous, but the professor clarified them later.",
    "Average experience. The textbook covered most of the material, so lecture slides felt repetitive.",
    "The exam difficulty was moderate. Some questions required extra practice outside the syllabus.",
    "Punctuality was fine, though lectures sometimes ended abruptly without time for questions.",
    "Fair grading system, but feedback on homework assignments took more than two weeks.",
    "The course covers a lot of ground. It requires consistent effort every week to keep up.",
    "Decent support during office hours, though slot availability was limited due to high demand.",
    "Overall acceptable course structure. Slide quality could be improved with more visual diagrams."
]

REALISTIC_NEGATIVE_COMMENTS = [
    "Lectures were quite dry and heavily reliant on reading text straight off the slides. Hard to stay focused.",
    "Assignment deadlines coincided with midterm exams, creating an overwhelming workload in week 7.",
    "Lab equipment was outdated and software licenses frequently expired during practice sessions.",
    "Communication needs major improvement. Emails sent regarding assignment extensions were rarely answered.",
    "Grading criteria for the final project felt arbitrary and lacked detailed rubric feedback.",
    "Professor was frequently 15 minutes late to morning lectures, shortening available discussion time.",
    "Exams contained questions on topics that were never covered in lectures or recommended reading.",
    "Course content is outdated and does not reflect current industry standards in software engineering.",
    "Lack of support during lab sessions. The teaching assistants were unresponsive to student queries.",
    "High stress environment. The grading curve was harsh and negative feedback was unconstructive."
]

def seed_database():
    db = SessionLocal()
    try:
        print("Cleaning existing database records...")
        db.query(Feedback).delete()
        db.query(FacultyCourse).delete()
        db.query(Course).delete()
        db.query(User).delete()
        db.query(Department).delete()
        db.commit()

        print("Seeding Departments...")
        cse = Department(name="Computer Science & Engineering", code="CSE", description="Department of Computer Science")
        dsai = Department(name="Data Science & Artificial Intelligence", code="DSAI", description="Department of AI & Data Science")
        it = Department(name="Information Technology", code="IT", description="Department of Information Technology")
        
        db.add_all([cse, dsai, it])
        db.commit()

        print("Seeding Admin User...")
        admin = User(
            email="admin@feedbackiq.edu",
            hashed_password=get_password_hash("adminpassword123"),
            full_name="System Administrator",
            role=UserRole.ADMIN,
            department_id=cse.id
        )
        db.add(admin)
        db.commit()

        print("Seeding Faculty Users...")
        faculty_members = [
            User(email="dr.smith@feedbackiq.edu", hashed_password=get_password_hash("faculty123"), full_name="Dr. Alan Smith", role=UserRole.FACULTY, department_id=cse.id),
            User(email="dr.johnson@feedbackiq.edu", hashed_password=get_password_hash("faculty123"), full_name="Dr. Sarah Johnson", role=UserRole.FACULTY, department_id=dsai.id),
            User(email="prof.williams@feedbackiq.edu", hashed_password=get_password_hash("faculty123"), full_name="Prof. Michael Williams", role=UserRole.FACULTY, department_id=it.id),
            User(email="dr.brown@feedbackiq.edu", hashed_password=get_password_hash("faculty123"), full_name="Dr. Emily Brown", role=UserRole.FACULTY, department_id=cse.id),
            User(email="prof.davis@feedbackiq.edu", hashed_password=get_password_hash("faculty123"), full_name="Prof. Robert Davis", role=UserRole.FACULTY, department_id=dsai.id),
        ]
        db.add_all(faculty_members)
        db.commit()

        print("Seeding Student Users...")
        students = []
        for i in range(1, 21):
            s = User(
                email=f"student{i}@feedbackiq.edu",
                hashed_password=get_password_hash("student123"),
                full_name=f"Student User {i}",
                role=UserRole.STUDENT,
                department_id=random.choice([cse.id, dsai.id, it.id])
            )
            students.append(s)
        db.add_all(students)
        db.commit()

        print("Seeding Courses...")
        courses = [
            Course(code="CS101", title="Data Structures & Algorithms", department_id=cse.id),
            Course(code="CS202", title="Database Management Systems", department_id=cse.id),
            Course(code="CS303", title="Machine Learning & Neural Networks", department_id=dsai.id),
            Course(code="CS404", title="Web Application Security", department_id=it.id),
            Course(code="AI101", title="Fundamentals of Artificial Intelligence", department_id=dsai.id),
            Course(code="AI202", title="Natural Language Processing", department_id=dsai.id),
            Course(code="IT301", title="Full-Stack Web Development", department_id=it.id),
            Course(code="IT402", title="Software Engineering & Agile", department_id=it.id),
        ]
        db.add_all(courses)
        db.commit()

        print("Seeding Faculty Course Mappings...")
        faculty_course_mappings = [
            FacultyCourse(faculty_id=faculty_members[0].id, course_id=courses[0].id, semester="Fall", year=2025),
            FacultyCourse(faculty_id=faculty_members[0].id, course_id=courses[1].id, semester="Fall", year=2025),
            FacultyCourse(faculty_id=faculty_members[1].id, course_id=courses[2].id, semester="Fall", year=2025),
            FacultyCourse(faculty_id=faculty_members[1].id, course_id=courses[5].id, semester="Fall", year=2025),
            FacultyCourse(faculty_id=faculty_members[2].id, course_id=courses[3].id, semester="Fall", year=2025),
            FacultyCourse(faculty_id=faculty_members[2].id, course_id=courses[6].id, semester="Fall", year=2025),
            FacultyCourse(faculty_id=faculty_members[3].id, course_id=courses[7].id, semester="Fall", year=2025),
            FacultyCourse(faculty_id=faculty_members[4].id, course_id=courses[4].id, semester="Fall", year=2025),
        ]
        db.add_all(faculty_course_mappings)
        db.commit()

        print("Seeding 500+ Realistic Feedback Entries with Sentiment & Aspect Analysis...")
        now = datetime.utcnow()

        feedback_count = 0
        target_count = 520

        while feedback_count < target_count:
            # Pick a sentiment bucket with realistic weighting (60% positive, 25% neutral, 15% negative)
            rand_val = random.random()
            if rand_val < 0.60:
                comment = random.choice(REALISTIC_POSITIVE_COMMENTS)
                rating = random.choice([4, 5, 5])
            elif rand_val < 0.85:
                comment = random.choice(REALISTIC_NEUTRAL_COMMENTS)
                rating = 3
            else:
                comment = random.choice(REALISTIC_NEGATIVE_COMMENTS)
                rating = random.choice([1, 2])

            course = random.choice(courses)
            # Find eligible faculty for this course
            eligible_fac = [m.faculty_id for m in faculty_course_mappings if m.course_id == course.id]
            faculty_id = random.choice(eligible_fac) if eligible_fac else faculty_members[0].id
            student = random.choice(students)
            is_anonymous = random.choice([True, False, False])

            # Random date within last 180 days
            days_ago = random.randint(0, 180)
            created_at = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))

            feedback_in = FeedbackCreate(
                course_id=course.id,
                faculty_id=faculty_id,
                rating=rating,
                raw_comment=comment,
                is_anonymous=is_anonymous
            )

            entry = create_feedback_entry(
                db,
                feedback_in,
                student_id=None if is_anonymous else student.id,
                force_model="vader"  # Use VADER for fast deterministic seeding
            )
            
            # Override created_at date for historical time-series analytics
            entry.created_at = created_at
            if entry.sentiment_result:
                entry.sentiment_result.created_at = created_at
            db.commit()

            feedback_count += 1
            if feedback_count % 100 == 0:
                print(f"  Processed {feedback_count}/{target_count} feedback entries...")

        print(f"Successfully seeded database with {feedback_count} feedback entries!")
        print("\n--- DEMO CREDENTIALS ---")
        print("Admin:   email='admin@feedbackiq.edu' / password='adminpassword123'")
        print("Faculty: email='dr.smith@feedbackiq.edu' / password='faculty123'")
        print("Student: email='student1@feedbackiq.edu' / password='student123'")
        print("------------------------\n")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

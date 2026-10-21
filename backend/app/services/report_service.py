import io
import csv
from typing import Optional
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.models.models import Feedback, SentimentResult, Course, User
from app.services.analytics_service import get_overview_analytics

def generate_csv_report(db: Session, faculty_id: Optional[int] = None) -> str:
    """
    Generates a clean CSV export string of feedback items.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Feedback ID", "Date", "Course Code", "Course Title", "Faculty Name", 
        "Rating", "Sentiment", "Confidence", "Model Used", "Comment"
    ])

    query = db.query(Feedback).join(SentimentResult)
    if faculty_id:
        query = query.filter(Feedback.faculty_id == faculty_id)

    feedbacks = query.all()
    for f in feedbacks:
        s = f.sentiment_result
        course_code = f.course.code if f.course else "N/A"
        course_title = f.course.title if f.course else "N/A"
        faculty_name = f.faculty.full_name if f.faculty else "N/A"

        writer.writerow([
            f.id,
            f.created_at.strftime("%Y-%m-%d %H:%M"),
            course_code,
            course_title,
            faculty_name,
            f.rating,
            s.sentiment if s else "N/A",
            round(s.confidence, 4) if s else "N/A",
            s.model_used if s else "N/A",
            f.raw_comment
        ])

    return output.getvalue()

def generate_pdf_report(db: Session, faculty_id: Optional[int] = None) -> bytes:
    """
    Generates a professional PDF report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=12
    )
    subtitle_style = ParagraphStyle(
        'SubTitleStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=18
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=12,
        spaceAfter=8
    )
    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#334155')
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("FeedbackIQ - Sentiment Analysis Executive Report", title_style))
    scope_str = "Global System Overview" if not faculty_id else "Faculty Specific Report"
    elements.append(Paragraph(f"Scope: {scope_str} | Generated automatically by FeedbackIQ AI System", subtitle_style))

    # Overview KPI Table
    kpis = get_overview_analytics(db, faculty_id=faculty_id)
    kpi_data = [
        ["Total Feedback", "Positive %", "Average Rating", "Active Courses", "Active Faculty"],
        [
            str(kpis["total_feedback"]),
            f"{kpis['positive_percentage']}%",
            f"{kpis['average_rating']} / 5.0",
            str(kpis["active_courses"]),
            str(kpis["active_faculty"])
        ]
    ]

    t_kpi = Table(kpi_data, colWidths=[108]*5)
    t_kpi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6366F1')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F8FAFC')),
        ('TEXTCOLOR', (0,1), (-1,1), colors.HexColor('#0F172A')),
        ('FONTSIZE', (0,1), (-1,1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    elements.append(t_kpi)
    elements.append(Spacer(1, 15))

    # Sample Recent Feedback Section
    elements.append(Paragraph("Recent Analyzed Feedback Records", heading_style))

    query = db.query(Feedback).join(SentimentResult)
    if faculty_id:
        query = query.filter(Feedback.faculty_id == faculty_id)
    feedbacks = query.order_by(Feedback.created_at.desc()).limit(25).all()

    table_data = [
        ["ID", "Course", "Faculty", "Rating", "Sentiment", "Confidence", "Comment Sample"]
    ]

    for f in feedbacks:
        s = f.sentiment_result
        course_code = f.course.code if f.course else "N/A"
        fac_name = f.faculty.full_name if f.faculty else "N/A"
        sent_str = s.sentiment if s else "N/A"
        conf_str = f"{round(s.confidence * 100, 1)}%" if s else "N/A"
        comment_snippet = (f.raw_comment[:60] + "...") if len(f.raw_comment) > 60 else f.raw_comment

        table_data.append([
            Paragraph(str(f.id), cell_style),
            Paragraph(course_code, cell_style),
            Paragraph(fac_name, cell_style),
            Paragraph(f"{f.rating} ★", cell_style),
            Paragraph(sent_str, cell_style),
            Paragraph(conf_str, cell_style),
            Paragraph(comment_snippet, cell_style)
        ])

    t_feedback = Table(table_data, colWidths=[30, 55, 80, 45, 60, 60, 210])
    t_feedback.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F1F5F9')]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    elements.append(t_feedback)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

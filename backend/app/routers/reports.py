from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, UserRole
from app.services.report_service import generate_csv_report, generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports Export"])

@router.get("/export")
def export_report(
    format: str = Query("csv", pattern="^(csv|pdf)$"),
    faculty_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Faculty role is restricted to their own faculty ID
    target_fac_id = faculty_id
    if current_user.role == UserRole.FACULTY:
        target_fac_id = current_user.id

    if format.lower() == "csv":
        csv_data = generate_csv_report(db, faculty_id=target_fac_id)
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=feedbackiq_report.csv"}
        )
    elif format.lower() == "pdf":
        pdf_bytes = generate_pdf_report(db, faculty_id=target_fac_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=feedbackiq_executive_report.pdf"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported report format. Use 'csv' or 'pdf'.")

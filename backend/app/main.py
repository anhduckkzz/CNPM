from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Dict
import io

from app.repositories.in_memory import PortalRepository
from app.services.auth_service import AuthService, PortalService

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.enums import TA_CENTER
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("Warning: ReportLab not installed. PDF generation will not work. Run: pip install reportlab")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str | None = None


repository = PortalRepository()
auth_service = AuthService(repository)
portal_service = PortalService(repository)

app = FastAPI(
    title='HCMUT Portal API',
    description='Mock API powering the Tutor-Student portal demo.',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

BACKEND_DIR = Path(__file__).resolve().parents[1]
IMAGES_DIR = BACKEND_DIR / 'static' / 'images'
MATERIALS_DIR = BACKEND_DIR / 'static' / 'materials'
PDF_DIR = BACKEND_DIR / 'static' / 'pdfs'

# Ensure static directories exist before mounting/serving.
MATERIALS_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)

if IMAGES_DIR.exists():
    app.mount('/images', StaticFiles(directory=IMAGES_DIR), name='images')

if MATERIALS_DIR.exists():
    app.mount('/materials', StaticFiles(directory=MATERIALS_DIR), name='materials')

def _resolve_static_file(base_dir: Path, relative_path: str) -> Path:
    requested_path = (base_dir / relative_path).resolve()
    if base_dir not in requested_path.parents or not requested_path.is_file():
        raise HTTPException(status_code=404, detail='File not found')
    return requested_path

@app.get('/health')
def health_check():
    return {'status': 'ok'}


@app.post('/api/auth/login')
def login(payload: LoginRequest):
    try:
        return auth_service.login(payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get('/api/portal/{role}/bundle')
def fetch_portal_bundle(role: str):
    role = role.lower()
    if role not in {'student', 'tutor', 'staff'}:
        raise HTTPException(status_code=404, detail='Role not supported')
    return portal_service.bundle_for(role)  # type: ignore[arg-type]


@app.put('/api/portal/{role}/bundle')
def update_portal_bundle(role: str, bundle: Dict):
    role = role.lower()
    if role not in {'student', 'tutor', 'staff'}:
        raise HTTPException(status_code=404, detail='Role not supported')
    portal_service.update_bundle_for(role, bundle)
    return {'status': 'success', 'message': f'Bundle for {role} updated successfully.'}

@app.post('/api/materials/upload')
async def upload_material(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail='A file is required')

    extension = Path(file.filename).suffix
    safe_name = f'{uuid4().hex}{extension or ""}'
    target_path = MATERIALS_DIR / safe_name

    content = await file.read()
    target_path.write_bytes(content)

    return {
        'status': 'success',
        'filename': file.filename,
        'stored_as': safe_name,
        'url': f'/materials/{safe_name}',
        'message': 'Material uploaded successfully.',
    }

@app.get('/pdfs/{file_path:path}')
def serve_pdf(file_path: str):
    if not PDF_DIR.exists():
        raise HTTPException(status_code=404, detail='PDF directory not configured')
    if not file_path.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='Only PDF files are allowed')

    static_file = _resolve_static_file(PDF_DIR.resolve(), file_path)
    response = FileResponse(static_file, media_type='application/pdf')
    response.headers['Content-Disposition'] = f'inline; filename=\"{static_file.name}\"'
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return response


class GenerateReportRequest(BaseModel):
    reportType: str
    records: list[dict]
    metadata: dict


@app.post('/api/reports/generate-pdf')
async def generate_pdf_report(request: GenerateReportRequest):
    """Generate a PDF report using ReportLab"""
    if not REPORTLAB_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail='PDF generation service unavailable. ReportLab not installed.'
        )
    
    try:
        # Generate PDF using ReportLab
        buffer = io.BytesIO()
        generate_reportlab_pdf(buffer, request.reportType, request.records, request.metadata)
        buffer.seek(0)
        
        # Return the PDF as a streaming response
        return StreamingResponse(
            buffer,
            media_type='application/pdf',
            headers={
                'Content-Disposition': f'inline; filename="report_{request.reportType}.pdf"',
                'Cache-Control': 'no-cache'
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to generate PDF: {str(e)}')


def generate_reportlab_pdf(buffer, report_type: str, records: list[dict], metadata: dict):
    """Generate PDF using ReportLab with Vietnamese Unicode support"""
    
    # Register DejaVu fonts for full Unicode support (including Vietnamese)
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfbase import pdfmetrics
    import os
    
    # Get the backend directory path
    backend_dir = Path(__file__).resolve().parents[1]
    fonts_dir = backend_dir / 'fonts' / 'dejavu-fonts-ttf-2.37' / 'ttf'
    
    # Register DejaVu fonts
    try:
        dejavu_regular = str(fonts_dir / 'DejaVuSans.ttf')
        dejavu_bold = str(fonts_dir / 'DejaVuSans-Bold.ttf')
        
        if os.path.exists(dejavu_regular) and os.path.exists(dejavu_bold):
            pdfmetrics.registerFont(TTFont('DejaVuSans', dejavu_regular))
            pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', dejavu_bold))
            font_name = 'DejaVuSans'
            font_name_bold = 'DejaVuSans-Bold'
        else:
            # Fallback to Helvetica
            font_name = 'Helvetica'
            font_name_bold = 'Helvetica-Bold'
    except Exception as e:
        print(f"Warning: Could not load DejaVu fonts: {e}. Using Helvetica.")
        font_name = 'Helvetica'
        font_name_bold = 'Helvetica-Bold'
    
    # Create PDF document
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles with Unicode support
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName=font_name_bold
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName=font_name
    )
    
    # Report titles in Vietnamese
    report_titles = {
        'scholarship': 'BÁO CÁO HỌC BỔNG',
        'academic': 'BÁO CÁO HỌC TẬP',
        'feedback': 'BÁO CÁO PHẢN HỒI'
    }
    
    title = report_titles.get(report_type, 'BÁO CÁO')
    
    # Add title and subtitle - encode Vietnamese properly
    elements.append(Paragraph(title, title_style))
    elements.append(Paragraph('Trường Đại học Bách Khoa TP.HCM', subtitle_style))
    elements.append(Spacer(1, 20))
    
    # Add metadata
    metadata_data = [
        ['Ngày tạo:', metadata.get('generatedDate', 'N/A'), 'Tổng sinh viên:', str(metadata.get('totalStudents', 0))],
        ['Sinh viên đang học:', str(metadata.get('activeStudents', 0)), 'Điểm TB:', metadata.get('averageGPA', 'N/A')]
    ]
    
    metadata_table = Table(metadata_data, colWidths=[2*inch, 2*inch, 2*inch, 1.5*inch])
    metadata_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#475569')),
        ('FONTNAME', (0, 0), (-1, -1), font_name_bold),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0'))
    ]))
    elements.append(metadata_table)
    elements.append(Spacer(1, 20))
    
    # Prepare table data based on report type
    if report_type == 'scholarship':
        table_data = [['#', 'Mã SV', 'Họ và Tên', 'Ngành', 'GPA', 'Trạng thái']]
        for record in records:
            status = 'Đủ điều kiện' if record.get('status') == 'Active' else 'Không đủ'
            # Ensure Vietnamese names are properly encoded
            table_data.append([
                str(record.get('order')),
                record.get('studentId', ''),
                record.get('name', ''),  # Keep Vietnamese name as-is
                record.get('major', ''),
                record.get('gpa', ''),
                status
            ])
    
    elif report_type == 'academic':
        table_data = [['#', 'Mã SV', 'Họ và Tên', 'Ngành', 'GPA', 'Điểm RL', 'Xếp loại']]
        for record in records:
            gpa = float(record.get('gpa', 0))
            conduct_score = round(gpa * 25)
            standing = 'Xuất sắc' if gpa >= 3.5 else 'Giỏi' if gpa >= 3.0 else 'Khá'
            # Ensure Vietnamese names are properly encoded
            table_data.append([
                str(record.get('order')),
                record.get('studentId', ''),
                record.get('name', ''),  # Keep Vietnamese name as-is
                record.get('major', ''),
                record.get('gpa', ''),
                str(conduct_score),
                standing
            ])
    
    else:  # feedback
        table_data = [['#', 'Mã SV', 'Họ và Tên', 'Ngành', 'GPA', 'Trạng thái', 'Điểm danh']]
        for record in records:
            attendance = '85%' if record.get('status') == 'Active' else '60%'
            # Ensure Vietnamese names are properly encoded
            table_data.append([
                str(record.get('order')),
                record.get('studentId', ''),
                record.get('name', ''),  # Keep Vietnamese name as-is
                record.get('major', ''),
                record.get('gpa', ''),
                record.get('status', ''),
                attendance
            ])
    
    # Create the table
    if report_type == 'scholarship':
        col_widths = [0.4*inch, 0.8*inch, 2*inch, 1.8*inch, 0.6*inch, 1.2*inch]
    elif report_type == 'academic':
        col_widths = [0.4*inch, 0.8*inch, 1.8*inch, 1.5*inch, 0.6*inch, 0.7*inch, 1*inch]
    else:
        col_widths = [0.4*inch, 0.8*inch, 1.8*inch, 1.3*inch, 0.6*inch, 1*inch, 0.9*inch]
    
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    # Table styling
    table_style = [
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), font_name_bold),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), font_name),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]
    
    table.setStyle(TableStyle(table_style))
    elements.append(table)
    
    # Add footer
    elements.append(Spacer(1, 30))
    
    # Create footer style
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#94a3b8'),
        alignment=TA_CENTER,
        fontName=font_name
    )
    
    footer_text1 = '© 2025 Trường Đại học Bách Khoa TP.HCM - Văn phòng Công tác Sinh viên'
    footer_text2 = '268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM'
    
    elements.append(Paragraph(footer_text1, footer_style))
    elements.append(Paragraph(footer_text2, footer_style))
    
    # Build PDF
    doc.build(elements)

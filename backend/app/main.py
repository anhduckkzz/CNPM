from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import Dict

from app.repositories.in_memory import PortalRepository
from app.services.auth_service import AuthService, PortalService


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

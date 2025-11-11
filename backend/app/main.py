from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

if IMAGES_DIR.exists():
    app.mount('/images', StaticFiles(directory=IMAGES_DIR), name='images')

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

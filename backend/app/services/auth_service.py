from __future__ import annotations

from dataclasses import asdict
from typing import Dict

from app.models.user import Role
from app.repositories.in_memory import PortalRepository


class AuthService:
    """Handles sign-in validation for demo accounts."""

    def __init__(self, repository: PortalRepository) -> None:
        self._repository = repository

    def login(self, email: str) -> Dict:
        if not email.endswith('@hcmut.edu.vn'):
            raise ValueError('Please sign in using your @hcmut.edu.vn account.')

        user = self._repository.find_user_by_email(email)
        token = f'mock-token-{user.role}'
        return {
            'token': token,
            'role': user.role,
            'user': asdict(user),
        }


class PortalService:
    """Provides read-only bundles tailored to a given role."""

    def __init__(self, repository: PortalRepository) -> None:
        self._repository = repository

    def bundle_for(self, role: Role):
        return self._repository.get_portal_bundle(role)

    def update_bundle_for(self, role: Role, bundle: Dict):
        self._repository.update_portal_bundle(role, bundle)

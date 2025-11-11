from __future__ import annotations
import json
import os
from dataclasses import asdict
from typing import Dict

from app.models.user import Role, User

HERO_IMAGE_URL = '/images/hcmut2.png'


class PortalRepository:
    """Keeps in-memory fixtures describing each role experience."""

    def __init__(self) -> None:
        self._user_directory: Dict[Role, User] = {}
        self._bundles: Dict[Role, Dict] = {}
        self._bootstrap()

    def _bootstrap(self) -> None:
        data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
        for role in ['student', 'tutor', 'staff']:
            json_path = os.path.join(data_dir, role, f'{role}@hcmut.edu.vn.json')
            with open(json_path, 'r', encoding='utf-8') as f:
                bundle = json.load(f)
                self._bundles[role] = bundle
                user_data = bundle['user']
                self._user_directory[role] = User(
                    identifier=user_data['identifier'],
                    name=user_data['name'],
                    email=user_data['email'],
                    title=user_data['title'],
                    avatar=user_data['avatar'],
                    role=user_data['role'],
                )

    def find_user_by_email(self, email: str) -> User:
        local_part = email.split('@')[0].lower()
        if local_part.startswith('student'):
            return self._user_directory['student']
        if local_part.startswith('tutor'):
            return self._user_directory['tutor']
        return self._user_directory['staff']

    def get_portal_bundle(self, role: Role) -> Dict:
        return self._bundles[role].copy()

    def update_portal_bundle(self, role: Role, bundle: Dict) -> None:
        self._bundles[role] = bundle
        self.save_bundle(role)

    def save_bundle(self, role: Role) -> None:
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        json_path = os.path.join(data_dir, role, f'{role}@hcmut.edu.vn.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(self._bundles[role], f, indent=4, ensure_ascii=False)

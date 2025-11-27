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

    def _data_dir(self) -> str:
        return os.path.join(os.path.dirname(__file__), '..', '..', 'data')

    def _json_path(self, role: Role) -> str:
        return os.path.join(self._data_dir(), role, f'{role}@hcmut.edu.vn.json')

    def _set_user_from_bundle(self, role: Role, user_data: Dict) -> None:
        self._user_directory[role] = User(
            identifier=user_data['identifier'],
            name=user_data['name'],
            email=user_data['email'],
            title=user_data['title'],
            avatar=user_data['avatar'],
            role=user_data['role'],
        )

    def _apply_avatar_store(self, bundle: Dict) -> None:
        user_data = bundle.get('user') or {}
        avatars = bundle.get('avatars') or {}
        email = user_data.get('email')
        if email and avatars.get(email):
            user_data['avatar'] = avatars[email]

    def _sync_avatar_store(self, bundle: Dict) -> None:
        user_data = bundle.get('user') or {}
        email = user_data.get('email')
        avatar = user_data.get('avatar')
        if not email or not avatar:
            return
        avatars = bundle.get('avatars')
        if not isinstance(avatars, dict):
            avatars = {}
            bundle['avatars'] = avatars
        avatars[email] = avatar

    def _load_bundle(self, role: Role) -> Dict:
        json_path = self._json_path(role)
        with open(json_path, 'r', encoding='utf-8') as f:
            bundle = json.load(f)
            self._apply_avatar_store(bundle)
            self._bundles[role] = bundle
            user_data = bundle['user']
            self._set_user_from_bundle(role, user_data)
            return bundle

    def _bootstrap(self) -> None:
        for role in ['student', 'tutor', 'staff']:
            bundle = self._load_bundle(role)

    def find_user_by_email(self, email: str) -> User:
        local_part = email.split('@')[0].lower()
        if local_part.startswith('student'):
            return self._user_directory['student']
        if local_part.startswith('tutor'):
            return self._user_directory['tutor']
        return self._user_directory['staff']

    def get_portal_bundle(self, role: Role) -> Dict:
        try:
            bundle = self._load_bundle(role)
        except FileNotFoundError:
            bundle = self._bundles[role]
        return bundle.copy()

    def update_portal_bundle(self, role: Role, bundle: Dict) -> None:
        self._sync_avatar_store(bundle)
        self._bundles[role] = bundle
        if 'user' in bundle:
            self._set_user_from_bundle(role, bundle['user'])
        self.save_bundle(role)

    def save_bundle(self, role: Role) -> None:
        json_path = self._json_path(role)
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(self._bundles[role], f, indent=4, ensure_ascii=False)

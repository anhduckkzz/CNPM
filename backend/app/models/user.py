from dataclasses import dataclass
from typing import Literal

Role = Literal['student', 'tutor', 'staff']


@dataclass(slots=True, frozen=True)
class User:
    """Domain representation of a portal user."""

    identifier: str
    name: str
    email: str
    title: str
    avatar: str
    role: Role

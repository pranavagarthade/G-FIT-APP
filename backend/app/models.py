from typing import Literal

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    age: int | None = Field(default=None, ge=13, le=120)
    weight_kg: float | None = Field(default=None, gt=0, le=500)
    height_cm: float | None = Field(default=None, gt=0, le=300)
    goal: Literal["fat_loss", "muscle_gain", "maintenance"] | None = None
    activity_level: str | None = None
    dietary_preference: str | None = None
    injuries: list[str] = Field(default_factory=list)


class Source(BaseModel):
    title: str
    source: str
    topic: str


class ChatResult(BaseModel):
    answer: str
    sources: list[Source]
    suggestions: list[str]

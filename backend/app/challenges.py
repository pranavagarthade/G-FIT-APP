import hashlib
import hmac
import json
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

import razorpay
from fastapi import HTTPException
from pydantic import BaseModel, Field

from .config import settings


class JoinRequest(BaseModel):
    start_date: date
    timezone: str = "UTC"
    terms_version: str


class ProgressRequest(BaseModel):
    progress_date: date
    value: Decimal = Field(ge=0)
    source: str


def require_database() -> str:
    if not settings.database_url:
        raise HTTPException(status_code=503, detail="Commitment challenge database is not configured.")
    return settings.database_url


def require_razorpay() -> razorpay.Client:
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise HTTPException(status_code=503, detail="Razorpay is not configured.")
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if not settings.razorpay_key_secret:
        return False
    digest = hmac.new(
        settings.razorpay_key_secret.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(digest, signature)


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    if not settings.razorpay_webhook_secret:
        return False
    digest = hmac.new(settings.razorpay_webhook_secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)


def challenge_row(row: tuple[Any, ...]) -> dict[str, Any]:
    fields = (
        "id", "title", "description", "goal_type", "goal_value", "duration_days",
        "deposit_amount_minor", "currency", "completion_threshold", "refund_policy",
        "partial_refund_percent", "grace_days", "timezone", "status", "terms_version",
        "starts_at", "ends_at",
    )
    return dict(zip(fields, row, strict=True))


def serialize(value: Any) -> Any:
    if isinstance(value, (UUID, datetime, date, Decimal)):
        return str(value)
    if isinstance(value, list):
        return [serialize(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize(item) for key, item in value.items()}
    return value


def webhook_event_id(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def json_payload(payload: bytes) -> dict[str, Any]:
    try:
        value = json.loads(payload)
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=400, detail="Invalid webhook JSON.") from error
    if not isinstance(value, dict):
        raise HTTPException(status_code=400, detail="Invalid webhook payload.")
    return value

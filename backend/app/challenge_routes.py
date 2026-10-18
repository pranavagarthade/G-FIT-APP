from datetime import date, timedelta
from typing import Annotated, Any
from uuid import UUID

import psycopg
from fastapi import APIRouter, Header, HTTPException, Request

from .challenges import (
    JoinRequest,
    ProgressRequest,
    challenge_row,
    json_payload,
    require_database,
    require_razorpay,
    serialize,
    verify_razorpay_signature,
    verify_webhook_signature,
    webhook_event_id,
)
from .config import settings

router = APIRouter(prefix="/api")
USER_ID = Annotated[str | None, Header(alias="X-User-Id")]


def user_id_or_unauthenticated(user_id: str | None) -> str:
    if not user_id:
        raise HTTPException(status_code=401, detail="X-User-Id is required.")
    return user_id


@router.get("/challenges")
def list_challenges() -> list[dict[str, Any]]:
    with psycopg.connect(require_database()) as connection:
        rows = connection.execute(
            """SELECT id, title, description, goal_type, goal_value, duration_days,
                      deposit_amount_minor, currency, completion_threshold, refund_policy,
                      partial_refund_percent, grace_days, timezone, status, terms_version,
                      starts_at, ends_at
               FROM challenges WHERE status = 'active' ORDER BY starts_at NULLS LAST, created_at"""
        ).fetchall()
    return [serialize(challenge_row(row)) for row in rows]


@router.get("/challenges/{challenge_id}")
def get_challenge(challenge_id: UUID) -> dict[str, Any]:
    with psycopg.connect(require_database()) as connection:
        row = connection.execute(
            """SELECT id, title, description, goal_type, goal_value, duration_days,
                      deposit_amount_minor, currency, completion_threshold, refund_policy,
                      partial_refund_percent, grace_days, timezone, status, terms_version,
                      starts_at, ends_at
               FROM challenges WHERE id = %s""",
            (challenge_id,),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    return serialize(challenge_row(row))


@router.post("/challenges/{challenge_id}/join")
def join_challenge(challenge_id: UUID, body: JoinRequest, x_user_id: USER_ID) -> dict[str, Any]:
    user_id = user_id_or_unauthenticated(x_user_id)
    with psycopg.connect(require_database()) as connection:
        challenge = connection.execute(
            """SELECT deposit_amount_minor, currency, duration_days, terms_version, status
               FROM challenges WHERE id = %s FOR SHARE""",
            (challenge_id,),
        ).fetchone()
        if challenge is None or challenge[4] != "active":
            raise HTTPException(status_code=404, detail="Active challenge not found.")
        if body.terms_version != challenge[3]:
            raise HTTPException(status_code=409, detail="Challenge terms have changed.")
        end_date = body.start_date + timedelta(days=challenge[2] - 1)
        participation = connection.execute(
            """INSERT INTO user_challenges
                (user_id, challenge_id, start_date, end_date, timezone, accepted_terms_version)
               VALUES (%s, %s, %s, %s, %s, %s)
               ON CONFLICT (user_id, challenge_id, start_date)
               DO UPDATE SET updated_at = now()
               RETURNING id, status, start_date, end_date""",
            (user_id, challenge_id, body.start_date, end_date, body.timezone, body.terms_version),
        ).fetchone()
        if participation is None:
            raise HTTPException(status_code=409, detail="Unable to join challenge.")
        connection.commit()
    return {
        "userChallengeId": str(participation[0]),
        "status": participation[1],
        "startDate": str(participation[2]),
        "endDate": str(participation[3]),
        "next": "Create a Razorpay order before opening checkout.",
    }


@router.post("/user-challenges/{user_challenge_id}/payment-order")
def create_payment_order(
    user_challenge_id: UUID,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")],
    x_user_id: USER_ID,
) -> dict[str, Any]:
    user_id = user_id_or_unauthenticated(x_user_id)
    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Idempotency-Key is required.")
    with psycopg.connect(require_database()) as connection:
        row = connection.execute(
            """SELECT uc.id, c.deposit_amount_minor, c.currency, uc.status
               FROM user_challenges uc JOIN challenges c ON c.id = uc.challenge_id
               WHERE uc.id = %s AND uc.user_id = %s FOR UPDATE""",
            (user_challenge_id, user_id),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Challenge participation not found.")
        if row[3] != "pending_payment":
            raise HTTPException(status_code=409, detail="Challenge is not awaiting payment.")
        existing = connection.execute(
            """SELECT gateway_ref, amount_minor, currency FROM transactions
               WHERE user_challenge_id = %s AND idempotency_key = %s""",
            (user_challenge_id, idempotency_key),
        ).fetchone()
        if existing:
            return {"orderId": existing[0], "amount": existing[1], "currency": existing[2]}
        order = require_razorpay().order.create({
            "amount": row[1],
            "currency": row[2],
            "receipt": f"challenge-{user_challenge_id}",
            "notes": {"user_challenge_id": str(user_challenge_id)},
        })
        connection.execute(
            """INSERT INTO transactions
                (user_id, user_challenge_id, type, amount_minor, currency, gateway_ref, idempotency_key)
               VALUES (%s, %s, 'deposit', %s, %s, %s, %s)""",
            (user_id, user_challenge_id, row[1], row[2], order["id"], idempotency_key),
        )
        connection.commit()
    return {"orderId": order["id"], "amount": row[1], "currency": row[2], "keyId": settings.razorpay_key_id}


@router.post("/payments/razorpay/verify")
def verify_payment(
    payload: dict[str, str],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")],
    x_user_id: USER_ID,
) -> dict[str, str]:
    user_id = user_id_or_unauthenticated(x_user_id)
    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Idempotency-Key is required.")
    order_id = payload.get("razorpay_order_id", "")
    payment_id = payload.get("razorpay_payment_id", "")
    signature = payload.get("razorpay_signature", "")
    if not order_id or not payment_id or not verify_razorpay_signature(order_id, payment_id, signature):
        raise HTTPException(status_code=400, detail="Invalid Razorpay payment signature.")
    with psycopg.connect(require_database()) as connection:
        transaction = connection.execute(
            """SELECT id, user_challenge_id FROM transactions
               WHERE user_id = %s AND gateway_ref = %s AND type = 'deposit' FOR UPDATE""",
            (user_id, order_id),
        ).fetchone()
        if transaction is None:
            raise HTTPException(status_code=404, detail="Deposit order not found.")
        connection.execute(
            """UPDATE transactions SET status = 'succeeded', gateway_payment_ref = %s, updated_at = now()
               WHERE id = %s""",
            (payment_id, transaction[0]),
        )
        connection.execute(
            """UPDATE user_challenges SET status = 'active', payment_id = %s, updated_at = now()
               WHERE id = %s AND status = 'pending_payment'""",
            (transaction[0], transaction[1]),
        )
        connection.commit()
    return {"status": "active", "userChallengeId": str(transaction[1])}


@router.get("/user-challenges/{user_challenge_id}")
def get_user_challenge(user_challenge_id: UUID, x_user_id: USER_ID) -> dict[str, Any]:
    user_id = user_id_or_unauthenticated(x_user_id)
    with psycopg.connect(require_database()) as connection:
        row = connection.execute(
            """SELECT uc.id, uc.status, uc.start_date, uc.end_date, uc.progress_percent,
                      uc.grace_days_used, c.title, c.goal_type, c.goal_value,
                      c.deposit_amount_minor, c.currency
               FROM user_challenges uc JOIN challenges c ON c.id = uc.challenge_id
               WHERE uc.id = %s AND uc.user_id = %s""",
            (user_challenge_id, user_id),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Challenge participation not found.")
    fields = ("id", "status", "startDate", "endDate", "progressPercent", "graceDaysUsed",
              "title", "goalType", "goalValue", "depositAmountMinor", "currency")
    return serialize(dict(zip(fields, row, strict=True)))


@router.get("/user-challenges/{user_challenge_id}/transactions")
def list_transactions(user_challenge_id: UUID, x_user_id: USER_ID) -> list[dict[str, Any]]:
    user_id = user_id_or_unauthenticated(x_user_id)
    with psycopg.connect(require_database()) as connection:
        rows = connection.execute(
            """SELECT t.id, t.type, t.amount_minor, t.currency, t.gateway_ref,
                      t.gateway_payment_ref, t.status, t.failure_reason, t.created_at
               FROM transactions t WHERE t.user_challenge_id = %s AND t.user_id = %s
               ORDER BY t.created_at DESC""",
            (user_challenge_id, user_id),
        ).fetchall()
    fields = ("id", "type", "amountMinor", "currency", "gatewayRef", "gatewayPaymentRef",
              "status", "failureReason", "createdAt")
    return [serialize(dict(zip(fields, row, strict=True))) for row in rows]


@router.post("/user-challenges/{user_challenge_id}/progress")
def log_progress(
    user_challenge_id: UUID,
    body: ProgressRequest,
    x_user_id: USER_ID,
) -> dict[str, str]:
    user_id = user_id_or_unauthenticated(x_user_id)
    if body.source not in {"manual", "in_app", "health_connect", "healthkit"}:
        raise HTTPException(status_code=422, detail="Unsupported progress source.")
    with psycopg.connect(require_database()) as connection:
        row = connection.execute(
            """SELECT start_date, end_date FROM user_challenges
               WHERE id = %s AND user_id = %s AND status = 'active'""",
            (user_challenge_id, user_id),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Active challenge participation not found.")
        if not row[0] <= body.progress_date <= row[1]:
            raise HTTPException(status_code=422, detail="Progress date is outside the challenge.")
        verified = body.source in {"health_connect", "healthkit", "in_app"}
        suspicious = body.value > 100000 if body.source in {"health_connect", "healthkit"} else False
        connection.execute(
            """INSERT INTO daily_progress
                (user_challenge_id, progress_date, value, verified, source, suspicious, suspicious_reason)
               VALUES (%s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (user_challenge_id, progress_date, source)
               DO UPDATE SET value = EXCLUDED.value, verified = EXCLUDED.verified,
                 suspicious = EXCLUDED.suspicious, suspicious_reason = EXCLUDED.suspicious_reason""",
            (user_challenge_id, body.progress_date, body.value, verified, body.source,
             suspicious, "Impossible Health data" if suspicious else None),
        )
        connection.commit()
    return {"status": "recorded", "verified": str(verified).lower()}


@router.post("/payments/razorpay/webhook")
async def razorpay_webhook(request: Request, x_razorpay_signature: Annotated[str | None, Header()] = None) -> dict[str, str]:
    raw = await request.body()
    if not x_razorpay_signature or not verify_webhook_signature(raw, x_razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid Razorpay webhook signature.")
    payload = json_payload(raw)
    event_id = webhook_event_id(raw)
    event_type = str(payload.get("event", "unknown"))
    with psycopg.connect(require_database()) as connection:
        inserted = connection.execute(
            """INSERT INTO payment_webhook_events
                (gateway_event_id, event_type, payload, signature_verified)
               VALUES (%s, %s, %s::jsonb, true)
               ON CONFLICT (gateway_event_id) DO NOTHING
               RETURNING id""",
            (event_id, event_type, json.dumps(payload)),
        ).fetchone()
        if inserted:
            entity = payload.get("payload", {})
            payment_entity = entity.get("payment", {}).get("entity", {}) if isinstance(entity, dict) else {}
            refund_entity = entity.get("refund", {}).get("entity", {}) if isinstance(entity, dict) else {}
            payment_id = payment_entity.get("id")
            order_id = payment_entity.get("order_id")
            refund_id = refund_entity.get("id")
            refund_payment_id = refund_entity.get("payment_id")
            if event_type == "payment.captured" and payment_id and order_id:
                connection.execute(
                    """UPDATE transactions SET status = 'succeeded', gateway_payment_ref = %s, updated_at = now()
                       WHERE gateway_ref = %s AND type = 'deposit'""",
                    (payment_id, order_id),
                )
                connection.execute(
                    """UPDATE user_challenges SET status = 'active', payment_id = transactions.id, updated_at = now()
                       FROM transactions
                       WHERE transactions.gateway_ref = %s AND transactions.type = 'deposit'
                         AND transactions.status = 'succeeded'
                         AND user_challenges.id = transactions.user_challenge_id
                         AND user_challenges.status = 'pending_payment'""",
                    (order_id,),
                )
            elif event_type == "payment.failed" and order_id:
                connection.execute(
                    """UPDATE transactions SET status = 'failed', failure_reason = %s, updated_at = now()
                       WHERE gateway_ref = %s AND type = 'deposit'""",
                    ("Razorpay payment failed", order_id),
                )
            elif event_type == "refund.processed" and refund_id:
                connection.execute(
                    """UPDATE transactions SET status = 'succeeded', gateway_ref = %s, updated_at = now()
                       WHERE gateway_payment_ref = %s AND type = 'refund'""",
                    (refund_id, refund_payment_id),
                )
            elif event_type == "refund.failed" and refund_id:
                connection.execute(
                    """UPDATE transactions SET status = 'failed', failure_reason = %s, updated_at = now()
                       WHERE gateway_payment_ref = %s AND type = 'refund'""",
                    ("Razorpay refund failed", refund_payment_id),
                )
            connection.execute(
                """UPDATE payment_webhook_events SET status = 'processed', processed_at = now()
                   WHERE id = %s""",
                (inserted[0],),
            )
            connection.commit()
    return {"status": "accepted"}


@router.post("/user-challenges/{user_challenge_id}/refund")
def retry_refund(
    user_challenge_id: UUID,
    x_admin_key: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    if not settings.admin_challenge_key or x_admin_key != settings.admin_challenge_key:
        raise HTTPException(status_code=403, detail="Challenge administration is not authorized.")
    with psycopg.connect(require_database()) as connection:
        updated = connection.execute(
            """UPDATE transactions SET status = 'pending', failure_reason = NULL, updated_at = now()
               WHERE user_challenge_id = %s AND type = 'refund' AND status = 'failed'
               RETURNING id""",
            (user_challenge_id,),
        ).fetchone()
        if updated is None:
            raise HTTPException(status_code=404, detail="No failed refund is available for retry.")
        connection.execute(
            "UPDATE user_challenges SET status = 'refunding', updated_at = now() WHERE id = %s",
            (user_challenge_id,),
        )
        connection.commit()
    return {"status": "queued", "transactionId": str(updated[0])}

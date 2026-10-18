from datetime import date

import psycopg
import razorpay

from .challenges import require_database, require_razorpay


def evaluate_ended_challenges(today: date | None = None) -> int:
    evaluation_date = today or date.today()
    evaluated = 0
    with psycopg.connect(require_database()) as connection:
        rows = connection.execute(
            """SELECT uc.id, c.completion_threshold, c.grace_days, c.refund_policy,
                      c.deposit_amount_minor, c.partial_refund_percent
               FROM user_challenges uc
               JOIN challenges c ON c.id = uc.challenge_id
               WHERE uc.status = 'active' AND uc.end_date < %s
               FOR UPDATE OF uc SKIP LOCKED""",
            (evaluation_date,),
        ).fetchall()
        for row in rows:
            user_challenge_id, threshold, grace_days, policy, deposit, partial_percent = row
            completed_days = connection.execute(
                """SELECT count(*) FROM daily_progress
                   WHERE user_challenge_id = %s AND verified = true AND suspicious = false
                     AND value > 0""",
                (user_challenge_id,),
            ).fetchone()[0]
            total_days = connection.execute(
                "SELECT (end_date - start_date) + 1 FROM user_challenges WHERE id = %s",
                (user_challenge_id,),
            ).fetchone()[0]
            progress_percent = min(100, (completed_days + grace_days) * 100 / total_days)
            completed = progress_percent >= float(threshold)
            if completed:
                outcome = "completed"
                refund_amount = deposit
            elif policy == "partial_on_failure":
                outcome = "failed"
                refund_amount = int(deposit * float(partial_percent) / 100)
            else:
                outcome = "failed"
                refund_amount = 0
            connection.execute(
                """UPDATE user_challenges SET status = %s, progress_percent = %s,
                   evaluated_at = now(), updated_at = now() WHERE id = %s""",
                (outcome, progress_percent, user_challenge_id),
            )
            if refund_amount:
                connection.execute(
                    """INSERT INTO transactions
                         (user_id, user_challenge_id, type, amount_minor, currency, idempotency_key)
                       SELECT user_id, id, 'refund', %s, c.currency, %s
                       FROM user_challenges uc JOIN challenges c ON c.id = uc.challenge_id
                       WHERE uc.id = %s
                       ON CONFLICT (idempotency_key) DO NOTHING""",
                    (refund_amount, f"refund:{user_challenge_id}", user_challenge_id),
                )
                connection.execute(
                    """UPDATE transactions refund SET gateway_payment_ref = deposit.gateway_payment_ref
                       FROM transactions deposit
                       WHERE refund.id = (
                           SELECT id FROM transactions
                           WHERE user_challenge_id = %s AND type = 'refund'
                             AND idempotency_key = %s
                       )
                       AND deposit.user_challenge_id = refund.user_challenge_id
                       AND deposit.type = 'deposit' AND deposit.status = 'succeeded'""",
                    (user_challenge_id, f"refund:{user_challenge_id}"),
                )
                connection.execute(
                    "UPDATE user_challenges SET status = 'refunding' WHERE id = %s",
                    (user_challenge_id,),
                )
            elif not completed:
                connection.execute(
                    """INSERT INTO transactions
                        (user_id, user_challenge_id, type, amount_minor, currency, status, idempotency_key)
                       SELECT user_id, id, 'forfeit', %s, c.currency, 'succeeded', %s
                       FROM user_challenges uc JOIN challenges c ON c.id = uc.challenge_id
                       WHERE uc.id = %s
                       ON CONFLICT (idempotency_key) DO NOTHING""",
                    (deposit, f"forfeit:{user_challenge_id}", user_challenge_id),
                )
                connection.execute(
                    "UPDATE user_challenges SET status = 'forfeited' WHERE id = %s",
                    (user_challenge_id,),
                )
            evaluated += 1
        connection.commit()
    return evaluate_pending_refunds() + evaluated


def evaluate_pending_refunds() -> int:
    processed = 0
    with psycopg.connect(require_database()) as connection:
        rows = connection.execute(
            """SELECT refund.id, refund.user_challenge_id, refund.amount_minor,
                      deposit.gateway_payment_ref
               FROM transactions refund
               JOIN transactions deposit ON deposit.user_challenge_id = refund.user_challenge_id
                 AND deposit.type = 'deposit' AND deposit.status = 'succeeded'
               WHERE refund.type = 'refund' AND refund.status = 'pending'
                 AND deposit.gateway_payment_ref IS NOT NULL
               FOR UPDATE OF refund SKIP LOCKED"""
        ).fetchall()
        for refund_id, user_challenge_id, amount_minor, payment_ref in rows:
            try:
                result = require_razorpay().payment.refund(payment_ref, {"amount": amount_minor})
            except razorpay.errors.RazorpayError as error:
                connection.execute(
                    "UPDATE transactions SET status = 'failed', failure_reason = %s, updated_at = now() WHERE id = %s",
                    (str(error), refund_id),
                )
                continue
            connection.execute(
                """UPDATE transactions SET status = 'succeeded', gateway_ref = %s, updated_at = now()
                   WHERE id = %s""",
                (result.get("id"), refund_id),
            )
            connection.execute(
                "UPDATE user_challenges SET status = 'refunded', updated_at = now() WHERE id = %s",
                (user_challenge_id,),
            )
            processed += 1
        connection.commit()
    return processed


if __name__ == "__main__":
    print(f"Evaluated {evaluate_ended_challenges()} ended challenges.")

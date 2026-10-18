# Commitment Challenge architecture

## Decisions

- **Client:** React Native/Expo.
- **API:** FastAPI.
- **Database:** PostgreSQL.
- **Payments:** Razorpay hosted checkout and Razorpay Orders/Payments/Refunds APIs.
- **Money:** Integer minor units (`paise`) plus an ISO currency code; no floating-point money.
- **User identity:** The existing authenticated user ID will be passed to the API. The current prototype fallback (`prototype-user`) must be disabled before production payments.
- **Progress:** Health Connect and HealthKit are preferred, followed by in-app logs, then manual check-ins. Every progress row records its source and verification state.

## State flow

1. An admin publishes an `active` challenge with immutable terms version and refund policy.
2. The user accepts the terms. The API creates one `pending_payment` `user_challenges` row and a Razorpay order.
3. The client opens Razorpay hosted checkout. Card details never reach the app server.
4. The API verifies the Razorpay signature, records a successful deposit transaction, and moves the participation to `active`.
5. Progress endpoints accept only server-validated dates, values, sources, and challenge membership. Health sources are verified; manual values are marked unverified and capped/risk-scored.
6. A daily worker evaluates ended participations inside a database transaction. It locks the participation, calculates the threshold using verified progress plus configured grace days, and creates exactly one refund or forfeit transaction with an idempotency key.
7. Refund webhooks move `refunding` to `refunded`; failures remain retryable with exponential backoff and generate an admin alert.

## API surface for the next implementation phase

- `GET /api/challenges`
- `GET /api/challenges/{challenge_id}`
- `POST /api/challenges/{challenge_id}/join`
- `POST /api/challenges/{user_challenge_id}/payment-order`
- `POST /api/payments/razorpay/verify`
- `POST /api/payments/razorpay/webhook`
- `POST /api/user-challenges/{id}/progress`
- `GET /api/user-challenges/{id}`
- `GET /api/user-challenges/{id}/transactions`
- `POST /api/user-challenges/{id}/refund` (admin/retry workflow only; never client-authorized)

All mutating payment endpoints require an `Idempotency-Key`. Webhooks are deduplicated by Razorpay event ID and must verify the raw request body signature before processing.

## Anti-cheat and dispute rules

- Reject progress outside the participation's local calendar window.
- Reject impossible values and flag sudden spikes rather than silently accepting them.
- Prefer verified Health Connect/HealthKit data; manual data cannot satisfy a verified-only policy unless the challenge explicitly allows it.
- Enforce `grace_days` server-side and never let the client increment `grace_days_used`.
- A review row pauses automatic forfeiture/refund until an admin resolves the dispute.
- Store the accepted terms version on each participation so later challenge edits cannot change an existing user's contract.

## Worker and reliability design

The evaluator runs from a queue/cron at least once daily and is safe to rerun. It uses row locks, transaction-state checks, unique idempotency keys, and gateway references. Refund attempts use exponential backoff; after the configured retry limit the participation remains `refunding` and an admin notification is created. All financial state changes are represented by `transactions` and retained for audit.

## Migration

Apply [001_commitment_challenges.sql](../backend/migrations/001_commitment_challenges.sql) to PostgreSQL before implementing the API repository layer. The migration intentionally does not create a `users` table because authentication is not yet present in this prototype; `user_id` is therefore a stable external identifier.

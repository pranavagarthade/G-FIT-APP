CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE challenge_goal_type AS ENUM (
    'daily_steps',
    'weekly_workouts',
    'weight_loss'
);

CREATE TYPE challenge_status AS ENUM ('draft', 'active', 'paused', 'ended');
CREATE TYPE user_challenge_status AS ENUM (
    'pending_payment',
    'active',
    'completed',
    'failed',
    'refunding',
    'refunded',
    'forfeited',
    'cancelled'
);
CREATE TYPE refund_policy_type AS ENUM ('full_on_completion', 'threshold', 'partial_on_failure');
CREATE TYPE progress_source AS ENUM ('manual', 'in_app', 'health_connect', 'healthkit');
CREATE TYPE transaction_type AS ENUM ('deposit', 'refund', 'forfeit');
CREATE TYPE transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'reversed');
CREATE TYPE webhook_status AS ENUM ('received', 'processed', 'ignored', 'failed');
CREATE TYPE review_status AS ENUM ('open', 'approved', 'rejected');

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal_type challenge_goal_type NOT NULL,
    goal_value NUMERIC(12, 2) NOT NULL CHECK (goal_value > 0),
    duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 365),
    deposit_amount_minor BIGINT NOT NULL CHECK (deposit_amount_minor > 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    completion_threshold NUMERIC(5, 2) NOT NULL DEFAULT 90.00
        CHECK (completion_threshold BETWEEN 0 AND 100),
    refund_policy refund_policy_type NOT NULL DEFAULT 'full_on_completion',
    partial_refund_percent NUMERIC(5, 2)
        CHECK (partial_refund_percent IS NULL OR partial_refund_percent BETWEEN 0 AND 100),
    grace_days INTEGER NOT NULL DEFAULT 0 CHECK (grace_days BETWEEN 0 AND 30),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    status challenge_status NOT NULL DEFAULT 'draft',
    terms_version TEXT NOT NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (refund_policy <> 'partial_on_failure')
        OR partial_refund_percent IS NOT NULL
    )
);

CREATE TABLE user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    timezone TEXT NOT NULL,
    accepted_terms_version TEXT NOT NULL,
    payment_id UUID,
    status user_challenge_status NOT NULL DEFAULT 'pending_payment',
    progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0
        CHECK (progress_percent BETWEEN 0 AND 100),
    grace_days_used INTEGER NOT NULL DEFAULT 0 CHECK (grace_days_used >= 0),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    evaluated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, challenge_id, start_date)
);

CREATE TABLE daily_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
    progress_date DATE NOT NULL,
    value NUMERIC(12, 2) NOT NULL CHECK (value >= 0),
    verified BOOLEAN NOT NULL DEFAULT false,
    source progress_source NOT NULL,
    suspicious BOOLEAN NOT NULL DEFAULT false,
    suspicious_reason TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_challenge_id, progress_date, source)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_challenge_id UUID NOT NULL REFERENCES user_challenges(id),
    type transaction_type NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    gateway_ref TEXT,
    gateway_payment_ref TEXT,
    idempotency_key TEXT NOT NULL UNIQUE,
    status transaction_status NOT NULL DEFAULT 'pending',
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature_verified BOOLEAN NOT NULL,
    status webhook_status NOT NULL DEFAULT 'received',
    failure_reason TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE challenge_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
    opened_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    status review_status NOT NULL DEFAULT 'open',
    resolution TEXT,
    resolved_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE challenge_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    delivery_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_challenges
    ADD CONSTRAINT user_challenges_payment_fk
    FOREIGN KEY (payment_id) REFERENCES transactions(id);

CREATE INDEX user_challenges_user_status_idx
    ON user_challenges (user_id, status);
CREATE INDEX user_challenges_end_date_idx
    ON user_challenges (end_date, status);
CREATE INDEX daily_progress_challenge_date_idx
    ON daily_progress (user_challenge_id, progress_date);
CREATE INDEX transactions_challenge_status_idx
    ON transactions (user_challenge_id, type, status);
CREATE INDEX webhook_events_status_idx
    ON payment_webhook_events (status, received_at);
CREATE INDEX notifications_pending_idx
    ON challenge_notifications (status, created_at);

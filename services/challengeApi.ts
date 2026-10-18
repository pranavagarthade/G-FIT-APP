const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT_MS = 4000;

export interface Challenge {
  id: string;
  title: string;
  description: string;
  goal_type: string;
  goal_value: number;
  duration_days: number;
  deposit_amount_minor: number;
  currency: string;
  completion_threshold: number;
  refund_policy: string;
  grace_days: number;
  terms_version: string;
  status: string;
}

export async function listChallenges(): Promise<Challenge[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}/api/challenges`, { signal: controller.signal });
    if (!response.ok) throw new Error('Unable to load challenges.');
    return response.json() as Promise<Challenge[]>;
  } finally {
    clearTimeout(timeout);
  }
}

export async function joinChallenge(
  challengeId: string,
  termsVersion: string,
): Promise<{ userChallengeId: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/challenges/${challengeId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Id': 'prototype-user' },
    body: JSON.stringify({
      start_date: new Date().toISOString().slice(0, 10),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      terms_version: termsVersion,
    }),
  });
  if (!response.ok) throw new Error((await response.text()) || 'Unable to join challenge.');
  return response.json() as Promise<{ userChallengeId: string; status: string }>;
}

const previewChallenges: Challenge[] = [
  {
    id: 'preview-steps',
    title: '10,000 steps daily',
    description: 'Build a consistent walking habit and show up for your health every day.',
    goal_type: 'daily_steps',
    goal_value: 10000,
    duration_days: 30,
    deposit_amount_minor: 49900,
    currency: 'INR',
    completion_threshold: 90,
    refund_policy: 'full_on_completion',
    grace_days: 2,
    terms_version: 'preview-1',
    status: 'active',
  },
  {
    id: 'preview-workouts',
    title: 'Workout 5x per week',
    description: 'Complete four focused weeks of training with a small deposit at stake.',
    goal_type: 'weekly_workouts',
    goal_value: 5,
    duration_days: 28,
    deposit_amount_minor: 99900,
    currency: 'INR',
    completion_threshold: 90,
    refund_policy: 'full_on_completion',
    grace_days: 1,
    terms_version: 'preview-1',
    status: 'active',
  },
];

export { previewChallenges };

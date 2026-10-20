create extension if not exists "pgcrypto";

-- Seed challenge
insert into public.challenges (slug, title, description, days_left, enrolled_count, is_premium_only, starts_at, ends_at)
values (
  'sugar-detox',
  '15-Day Sugar Detox Challenge',
  'Eliminate refined sugars from your diet for 15 days. Track your meals, stay hydrated, and discover how much better you feel without processed sugars.',
  4,
  1254,
  true,
  now(),
  now() + interval '15 days'
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  days_left = excluded.days_left,
  enrolled_count = excluded.enrolled_count,
  is_premium_only = excluded.is_premium_only,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at;

-- Seed starter community posts
delete from public.community_posts;

insert into public.community_posts (user_id, content, post_type, likes_count, comments_count, created_at)
values
  (auth.uid(), 'Just completed my 30-day yoga streak! Feeling stronger and calmer than ever.', 'update', 47, 2, now()),
  (auth.uid(), 'My 6-month transformation! From struggling to touch my toes to doing full splits.', 'transformation', 124, 3, now() - interval '3 hours'),
  (auth.uid(), 'Post-workout smoothie recipe that keeps me going after morning yoga!', 'recipe', 38, 1, now() - interval '8 hours');

-- Seed leaderboard sample values for the challenge
delete from public.challenge_participants;

insert into public.challenge_participants (user_id, challenge_id, score, completed)
select p.id, c.id, 98, true from public.profiles p, public.challenges c where p.email = 'sneha@example.com' and c.slug = 'sugar-detox'
union all
select p.id, c.id, 95, true from public.profiles p, public.challenges c where p.email = 'priya@example.com' and c.slug = 'sugar-detox'
union all
select p.id, c.id, 92, false from public.profiles p, public.challenges c where p.email = 'kunal@example.com' and c.slug = 'sugar-detox';

-- Seed sample activity entries
insert into public.activity_logs (user_id, activity_type, duration_minutes, distance_km, calories, activity_date, metadata)
select p.id, 'Yoga', 45, null, 220, current_date - 1, '{}'::jsonb from public.profiles p where p.email = 'demo@gfit.app'
union all
select p.id, 'Walking', 30, 3.2, 180, current_date - 1, '{}'::jsonb from public.profiles p where p.email = 'demo@gfit.app'
union all
select p.id, 'Yoga', 60, null, 280, current_date - 2, '{}'::jsonb from public.profiles p where p.email = 'demo@gfit.app';

-- Seed monthly recap
insert into public.monthly_recaps (user_id, month, sessions_count, top_activity, best_streak, summary, share_image_url)
select p.id, 'August 2026', 22, 'Yoga', 12, 'You showed up 22 days this month and stayed consistent with your practice.', null
from public.profiles p where p.email = 'demo@gfit.app'
on conflict (user_id, month) do update set
  sessions_count = excluded.sessions_count,
  top_activity = excluded.top_activity,
  best_streak = excluded.best_streak,
  summary = excluded.summary;

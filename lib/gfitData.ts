import { supabase } from './supabase';

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  condition: string | null;
  is_premium: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityLogRow = {
  id: string;
  user_id: string;
  activity_type: string;
  duration_minutes: number | null;
  distance_km: number | null;
  calories: number | null;
  activity_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ChallengeRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  days_left: number;
  enrolled_count: number;
  is_premium_only: boolean;
  starts_at: string;
  ends_at: string;
};

export type CommunityPostRow = {
  id: string;
  user_id: string;
  content: string;
  post_type: 'update' | 'discussion' | 'transformation' | 'recipe';
  likes_count: number;
  comments_count: number;
  created_at: string;
};

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as ProfileRow | null;
}

export async function upsertProfile(profile: Partial<ProfileRow> & { id: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

export async function fetchUserActivities(userId: string, fromDate?: string, toDate?: string) {
  let query = supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('activity_date', { ascending: false });

  if (fromDate) query = query.gte('activity_date', fromDate);
  if (toDate) query = query.lte('activity_date', toDate);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ActivityLogRow[];
}

export async function saveActivity(input: {
  user_id: string;
  activity_type: string;
  duration_minutes?: number | null;
  distance_km?: number | null;
  calories?: number | null;
  metadata?: Record<string, unknown>;
  activity_date?: string;
}) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      ...input,
      activity_date: input.activity_date || new Date().toISOString().slice(0, 10),
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data as ActivityLogRow;
}

export async function fetchActiveChallenge() {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as ChallengeRow | null;
}

export async function fetchChallengeParticipants(challengeId: string) {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('score', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchCommunityPosts() {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CommunityPostRow[];
}

export async function createCommunityPost(input: {
  user_id: string;
  content: string;
  post_type: CommunityPostRow['post_type'];
}) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({ ...input })
    .select()
    .single();

  if (error) throw error;
  return data as CommunityPostRow;
}

export async function fetchAchievements(userId: string) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchChallengeLeaderboard(challengeId: string) {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select('id, score, user_id, profiles(full_name)')
    .eq('challenge_id', challengeId)
    .order('score', { ascending: false })
    .limit(5);

  if (error) throw error;

  return (data ?? []).map((entry: any, index: number) => ({
    rank: index + 1,
    name: entry.profiles?.full_name || 'Community member',
    score: entry.score,
  }));
}

export async function enrollUserInChallenge({
  userId,
  challengeId,
}: {
  userId: string;
  challengeId: string;
}) {
  const { data, error } = await supabase
    .from('challenge_participants')
    .upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        score: 0,
        completed: false,
      },
      { onConflict: 'user_id,challenge_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchMonthlyRecaps(userId: string) {
  const { data, error } = await supabase
    .from('monthly_recaps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

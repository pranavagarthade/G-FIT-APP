import { supabase } from './supabase';

export async function signUpWithEmail({
  email,
  password,
  fullName,
}: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || null,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        email: data.user.email || email,
        full_name: fullName || data.user.user_metadata?.full_name || null,
        condition: 'PCOS/PCOD',
        is_premium: false,
      },
      { onConflict: 'id' }
    );

    if (profileError) throw profileError;
  }

  return data;
}

export async function signInWithEmail({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPasswordForEmail(email: string) {
  const redirectTo = process.env.RESET_PASSWORD_REDIRECT_URL || 'gfit://reset-password';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

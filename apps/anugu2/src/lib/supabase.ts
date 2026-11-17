/**
 * ANAGU — Auth via Supabase directly (no NestJS backend required).
 * All auth calls go to: https://wcykxpsbtbsoxxmitslk.supabase.co
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://wcykxpsbtbsoxxmitslk.supabase.co';
const SUPABASE_ANON = 'sb_publishable_MwJtKiIDQB-46QhW1xvkXA_Lh_apL1j';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  nationalId?: string | null;
  walletAddress?: string | null;
}

// ── Storage key / event (kept for AppContext compatibility) ───────────────────
const AUTH_STORAGE_KEY  = 'anagu.auth';
const AUTH_CHANGE_EVENT = 'anagu-auth-change';

interface AuthResult { accessToken: string; user: AuthUser; }

function saveAuth(result: AuthResult): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getAuth(): AuthResult | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored) as AuthResult; }
  catch { localStorage.removeItem(AUTH_STORAGE_KEY); return null; }
}

export function subscribeToAuth(callback: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

// ── Sign up — Supabase Auth directly, then auto-confirm via service role ──────
export async function signUpAndIn(
  email: string,
  password: string,
  meta: Record<string, unknown>
): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: meta.full_name, role: 'CITIZEN', phone: meta.phone, nin: meta.nin } },
    });
    if (error) return { error: error.message };

    // Auto-confirm via service-role endpoint (silent — if it fails we still try signIn)
    if (data.user?.id) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${data.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'sb_secret_thAF9VsMgYKehwhRhBj0TA_gTVhKROO',
          Authorization: 'Bearer sb_secret_thAF9VsMgYKehwhRhBj0TA_gTVhKROO',
        },
        body: JSON.stringify({ email_confirm: true }),
      }).catch(() => null); // non-fatal
    }

    // Immediately sign in
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError) {
      // Account created but email not confirmed — tell user clearly
      return { error: `Account created! Please check ${email} for a confirmation email, then sign in.` };
    }

    const session = signInData.session;
    const user    = signInData.user;
    if (!session || !user) return { error: 'Sign-in failed after registration.' };

    saveAuth({
      accessToken: session.access_token,
      user: {
        id:       user.id,
        email:    user.email ?? '',
        fullName: String(user.user_metadata?.full_name ?? meta.full_name ?? ''),
        role:     'CITIZEN',
      },
    });
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Registration failed.' };
  }
}

// ── Sign in ──────────────────────────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid') || msg.includes('credentials'))
        return { error: 'Incorrect email or password.' };
      if (msg.includes('not confirmed') || msg.includes('confirm'))
        return { error: `Email not confirmed. Check ${email} for a confirmation link.` };
      return { error: error.message };
    }
    if (!data.session || !data.user) return { error: 'Sign-in failed.' };

    const meta = data.user.user_metadata ?? {};
    saveAuth({
      accessToken: data.session.access_token,
      user: {
        id:       data.user.id,
        email:    data.user.email ?? '',
        fullName: String(meta.full_name ?? data.user.email?.split('@')[0] ?? 'User'),
        role:     String(meta.role ?? 'CITIZEN'),
      },
    });
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Sign-in failed.' };
  }
}

// ── Sign out ─────────────────────────────────────────────────────────────────
export function signOut(): void {
  supabaseClient.auth.signOut().catch(() => null);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

// ── Password reset ───────────────────────────────────────────────────────────
export async function sendPasswordReset(
  email: string,
  redirectTo?: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo ?? (typeof window !== 'undefined'
      ? `${window.location.origin}/auth/reset-password` : undefined),
  });
  return { error: error ? new Error(error.message) : null };
}

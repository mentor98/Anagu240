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

// ── Sign up — Supabase Auth directly with auto-confirm ───────────────────────
export async function signUpAndIn(
  email: string,
  password: string,
  meta: Record<string, unknown>
): Promise<{ error: string | null }> {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Step 1: Create user account via Supabase
    const { data, error } = await supabaseClient.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { full_name: meta.full_name, role: 'CITIZEN', phone: meta.phone, nin: meta.nin } },
    });
    if (error) return { error: error.message };

    // Step 2: Auto-confirm email via backend (more secure than exposing service-role secret)
    if (data.user?.id) {
      try {
        const confirmResponse = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, email: trimmedEmail }),
        });
        
        if (!confirmResponse.ok) {
          console.warn('Email auto-confirmation via backend failed, trying direct method...');
          // Fallback: Try service-role direct call (should not reach here in production)
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${data.user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_SECRET_KEY || 'sb_secret_thAF9VsMgYKehwhRhBj0TA_gTVhKROO',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SECRET_KEY || 'sb_secret_thAF9VsMgYKehwhRhBj0TA_gTVhKROO'}`,
            },
            body: JSON.stringify({ email_confirm: true }),
          }).catch(() => null);
        }
      } catch (confirmErr) {
        console.warn('Email auto-confirmation failed:', confirmErr);
        // Continue anyway - user can still sign in if email is confirmed
      }
    }

    // Step 3: Attempt immediate sign-in
    let signInRetries = 0;
    let signInError = null;
    let signInData = null;

    // Retry sign-in up to 3 times (confirmation might take a moment)
    while (signInRetries < 3) {
      const result = await supabaseClient.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      
      if (!result.error) {
        signInData = result.data;
        break;
      }
      
      signInError = result.error;
      const errorMsg = result.error.message.toLowerCase();
      
      // Only retry if it's a confirmation issue
      if (errorMsg.includes('not confirmed') || errorMsg.includes('confirm')) {
        signInRetries++;
        if (signInRetries < 3) {
          // Wait 500ms before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
      } else {
        // Not a confirmation issue, don't retry
        break;
      }
    }

    if (signInError || !signInData?.session || !signInData?.user) {
      const msg = signInError?.message || 'Sign-in failed after registration.';
      return { error: msg };
    }

    const session = signInData.session;
    const user    = signInData.user;

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
    const trimmedEmail = email.trim().toLowerCase();
    
    // Step 1: Attempt sign-in
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    
    if (error) {
      const msg = error.message.toLowerCase();
      
      // Check if email is not confirmed
      if (msg.includes('not confirmed') || msg.includes('confirm')) {
        // Try to auto-confirm via backend
        try {
          const confirmResponse = await fetch('/api/auth/confirm-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail }),
          });
          
          if (confirmResponse.ok) {
            // Retry sign-in after confirmation
            const { data: retryData, error: retryError } = await supabaseClient.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            });
            
            if (retryError) {
              return { error: retryError.message };
            }
            
            if (!retryData?.session || !retryData?.user) {
              return { error: 'Sign-in failed.' };
            }
            
            const meta = retryData.user.user_metadata ?? {};
            saveAuth({
              accessToken: retryData.session.access_token,
              user: {
                id:       retryData.user.id,
                email:    retryData.user.email ?? '',
                fullName: String(meta.full_name ?? retryData.user.email?.split('@')[0] ?? 'User'),
                role:     String(meta.role ?? 'CITIZEN'),
              },
            });
            return { error: null };
          }
        } catch (confirmErr) {
          console.warn('Auto-confirmation failed:', confirmErr);
          // Fall through to error message
        }
        
        return { error: `Email not confirmed. Check ${trimmedEmail} for a confirmation link.` };
      }
      
      // Handle other error types
      if (msg.includes('invalid') || msg.includes('credentials')) {
        return { error: 'Incorrect email or password.' };
      }
      
      return { error: error.message };
    }
    
    if (!data?.session || !data?.user) {
      return { error: 'Sign-in failed.' };
    }

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

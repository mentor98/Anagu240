/**
 * ANAGU — Supabase client for the anugu2 Vite app
 * Project: https://wcykxpsbtbsoxxmitslk.supabase.co
 */
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL  = "https://wcykxpsbtbsoxxmitslk.supabase.co";
export const SUPABASE_ANON = "sb_publishable_MwJtKiIDQB-46QhW1xvkXA_Lh_apL1j";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Auto-confirm via Next.js API (runs alongside this app on port 3001) */
async function autoConfirm(userId: string): Promise<void> {
  try {
    await fetch("http://localhost:3001/api/auth/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  } catch { /* Next.js not running — email confirmation will be sent */ }
}

/** Sign up → auto-confirm → sign in (no email click needed) */
export async function signUpAndIn(
  email: string,
  password: string,
  meta: Record<string, unknown>
): Promise<{ error: string | null }> {
  const { data, error: e1 } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: meta },
  });
  if (e1) return { error: e1.message };
  if (data.user?.id) await autoConfirm(data.user.id);
  const { error: e2 } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(), password,
  });
  if (e2) return { error: "Account created! Check email to confirm, then sign in." };
  return { error: null };
}

/** Sign in with email + password */
export async function signIn(
  email: string, password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(), password,
  });
  if (!error) return { error: null };
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid") || msg.includes("credentials")) {
    return { error: "Incorrect email or password." };
  }
  if (msg.includes("confirm") || msg.includes("not confirmed")) {
    return { error: "Email not confirmed — check your inbox or use password: Anagu2026!" };
  }
  return { error: error.message };
}

export const signOut = () => supabase.auth.signOut();
export const getSession = () => supabase.auth.getSession().then(r => r.data.session);

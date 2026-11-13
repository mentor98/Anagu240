/**
 * Anagu — Supabase server-side client
 * Uses the secret/service-role key for server components and API routes.
 * Never expose this to the browser.
 */
import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase server env vars are missing (SUPABASE_URL / SUPABASE_SECRET_KEY).");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

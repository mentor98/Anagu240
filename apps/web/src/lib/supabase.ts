/**
 * Anagu — Supabase client (web)
 *
 * Project: https://wcykxpsbtbsoxxmitslk.supabase.co
 *
 * Used for:
 *  - Auth (citizen self-registration, magic links)
 *  - Realtime subscriptions (application status updates)
 *  - Direct DB reads where NestJS backend is not required (read-only)
 *
 * For writes that touch the blockchain or oracle pipeline, always go
 * through the NestJS backend API (api.ts) — never directly from the client.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL       = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY  = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
    "Check your .env.local file."
  );
}

/** Anon/public client — safe to use in browser */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
});

// ── Realtime helpers ──────────────────────────────────────────────────────

/**
 * Subscribe to live application status changes for a specific applicant.
 * Used in the citizen dashboard to update the UI without polling.
 */
export function subscribeToApplicationUpdates(
  applicantId: string,
  onUpdate: (payload: Record<string, unknown>) => void,
) {
  return supabase
    .channel(`applications:applicant_id=eq.${applicantId}`)
    .on(
      "postgres_changes",
      {
        event:  "*",
        schema: "public",
        table:  "applications",
        filter: `applicant_id=eq.${applicantId}`,
      },
      (payload) => onUpdate(payload as Record<string, unknown>),
    )
    .subscribe();
}

/**
 * Subscribe to title issuance events (for the registrar dashboard).
 */
export function subscribeToTitleEvents(
  onEvent: (payload: Record<string, unknown>) => void,
) {
  return supabase
    .channel("land_titles:all")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "land_titles" },
      (payload) => onEvent(payload as Record<string, unknown>),
    )
    .subscribe();
}

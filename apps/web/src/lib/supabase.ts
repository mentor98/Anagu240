/**
 * Anagu — Supabase client (web)
 * Project: https://wcykxpsbtbsoxxmitslk.supabase.co
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// Lazy initialisation — safe during Next.js build when env vars may be absent
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set. " +
        "Copy .env.example to apps/web/.env.local and fill them in."
      );
    }
    _client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getClient() as any)[prop];
  },
});

/** Subscribe to application status updates for a specific applicant. */
export function subscribeToApplicationUpdates(
  applicantId: string,
  onUpdate: (payload: Record<string, unknown>) => void,
) {
  return getClient()
    .channel(`applications:applicant_id=eq.${applicantId}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "applications",
      filter: `applicant_id=eq.${applicantId}`,
    }, (payload) => onUpdate(payload as Record<string, unknown>))
    .subscribe();
}

/** Subscribe to new title issuances (registrar dashboard). */
export function subscribeToTitleEvents(
  onEvent: (payload: Record<string, unknown>) => void,
) {
  return getClient()
    .channel("land_titles:all")
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "land_titles",
    }, (payload) => onEvent(payload as Record<string, unknown>))
    .subscribe();
}

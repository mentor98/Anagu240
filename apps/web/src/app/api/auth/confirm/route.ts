import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL    = "https://wcykxpsbtbsoxxmitslk.supabase.co";
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_KEY ?? "sb_secret_thAF9VsMgYKehwhRhBj0TA_gTVhKROO";

/**
 * POST /api/auth/confirm
 * Auto-confirms a user email after sign-up using the Supabase admin API.
 * Called server-side immediately after supabase.auth.signUp() so the user
 * can sign in right away without needing to click an email link.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json() as { userId: string };
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method:  "PUT",
      headers: {
        "Content-Type":  "application/json",
        "apikey":        SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ email_confirm: true }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("auto-confirm failed:", err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json({ confirmed: true });
  } catch (err) {
    console.error("auto-confirm error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

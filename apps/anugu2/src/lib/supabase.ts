import { publicApiRequest } from "./api";

const AUTH_STORAGE_KEY = "anagu.auth";
const AUTH_CHANGE_EVENT = "anagu-auth-change";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  nationalId?: string | null;
  walletAddress?: string | null;
}

interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

function saveAuth(result: AuthResult): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getAuth(): AuthResult | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthResult;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function subscribeToAuth(callback: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Create a local API account and immediately persist its JWT session. */
export async function signUpAndIn(
  email: string,
  password: string,
  meta: Record<string, unknown>
): Promise<{ error: string | null }> {
  try {
    const result = await publicApiRequest<AuthResult>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        fullName: String(meta.full_name ?? ""),
        nationalId: String(meta.nin ?? "") || undefined,
      }),
    });
    saveAuth(result);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Account registration failed." };
  }
}

/** Sign in with email + password without requiring an email confirmation. */
export async function signIn(
  email: string, password: string
): Promise<{ error: string | null }> {
  try {
    const result = await publicApiRequest<AuthResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    saveAuth(result);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign-in failed.";
    const normalized = message.toLowerCase();
    return {
      error: normalized.includes("unauthorized") || normalized.includes("401")
        ? "Incorrect email or password."
        : message,
    };
  }
}

export function signOut(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export async function sendPasswordReset(email: string, redirectTo?: string): Promise<{ error: Error | null }> {
  try {
    const res = await fetch("https://wcykxpsbtbsoxxmitslk.supabase.co/auth/v1/recover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "sb_publishable_MwJtKiIDQB-46QhW1xvkXA_Lh_apL1j",
      },
      body: JSON.stringify({
        email,
        gotrue_meta_security: {},
        redirect_to: redirectTo,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: new Error((data as any).msg ?? "Reset request failed") };
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error("Network error") };
  }
}

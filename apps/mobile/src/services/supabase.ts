/**
 * Anagu Mobile — Supabase client
 *
 * Project: https://wcykxpsbtbsoxxmitslk.supabase.co
 * JWKS:    https://wcykxpsbtbsoxxmitslk.supabase.co/auth/v1/.well-known/jwks.json
 *
 * Uses expo-secure-store for JWT persistence so tokens are stored
 * in the device keychain/keystore, not plain AsyncStorage.
 */
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL  = 'https://wcykxpsbtbsoxxmitslk.supabase.co';
const SUPABASE_ANON = 'sb_publishable_MwJtKiIDQB-46QhW1xvkXA_Lh_apL1j';

/** SecureStore adapter so Supabase uses the device keychain. */
const ExpoSecureStoreAdapter = {
  getItem:    (key: string)              => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string)              => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:           ExpoSecureStoreAdapter,
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: false,
  },
});

/** Sign in with email + password via Supabase Auth. */
export async function supabaseSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign up a new user via Supabase Auth. */
export async function supabaseSignUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role: 'CITIZEN' } },
  });
  if (error) throw error;
  return data;
}

/** Sign out. */
export async function supabaseSignOut() {
  await supabase.auth.signOut();
}

/** Get the current session JWT (sent to the NestJS backend as Bearer token). */
export async function getSessionToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Subscribe to realtime updates on application status. */
export function subscribeApplicationStatus(
  applicationId: string,
  onUpdate: (newStatus: string) => void,
) {
  return supabase
    .channel(`mobile-app-${applicationId}`)
    .on(
      'postgres_changes',
      {
        event:  'UPDATE',
        schema: 'public',
        table:  'applications',
        filter: `id=eq.${applicationId}`,
      },
      (payload: any) => onUpdate(payload.new.status),
    )
    .subscribe();
}

import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './client';

export interface AuthResult {
  session: Session | null;
  error: string | null;
}

async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { session: null, error: 'Supabase não configurado.' };
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { session: data.session, error: error?.message ?? null };
}

async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { session: null, error: 'Supabase não configurado.' };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data.session, error: error?.message ?? null };
}

async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export const authService = {
  isSupabaseConfigured,
  signUp,
  signIn,
  signOut,
  getSession,
  onAuthStateChange,
};

import { supabase, isSupabaseConfigured } from './client';
import { AppDatabaseState } from '../database/storage';

const TABLE = 'app_state';

/**
 * Pulls the saved state for the logged-in user, if any exists yet.
 * Returns null when Supabase isn't configured, nobody is logged in,
 * or this is the user's first time (no row saved yet).
 */
export async function pullRemoteState(userId: string): Promise<AppDatabaseState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[syncService] Falha ao buscar estado remoto:', error.message);
    return null;
  }
  return (data?.data as AppDatabaseState) ?? null;
}

/**
 * Upserts the full state for the logged-in user. Called on a short
 * debounce every time the local database changes.
 */
export async function pushRemoteState(userId: string, state: AppDatabaseState): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  if (error) {
    console.error('[syncService] Falha ao salvar estado remoto:', error.message);
    return false;
  }
  return true;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced push so we don't hit Supabase on every single keystroke/edit. */
export function scheduleRemotePush(userId: string, state: AppDatabaseState, delayMs = 1500) {
  if (!isSupabaseConfigured) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pushRemoteState(userId, state);
  }, delayMs);
}

export { isSupabaseConfigured };

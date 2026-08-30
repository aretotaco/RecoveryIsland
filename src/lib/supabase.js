import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
  }
  return supabase
}

export async function fetchProfile(userId) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('id, email, display_name, avatar_config, study_id')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertProfile({ id, email, displayName, avatarConfig, studyId }) {
  const client = requireSupabase()
  const payload = {
    id,
    email,
    display_name: displayName,
    avatar_config: avatarConfig || {},
    updated_at: new Date().toISOString(),
  }
  // Only include study_id when explicitly provided (profile creation) so
  // routine updates (display name, avatar) never risk clobbering it.
  if (studyId) payload.study_id = studyId

  const { data, error } = await client
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, email, display_name, avatar_config, study_id')
    .single()

  if (error) throw error
  return data
}

export async function upsertVillaEntry({ userId, category, source, entryDate, entryKey, payload }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('villa_entries')
    .upsert({
      user_id: userId,
      category,
      source,
      entry_date: entryDate,
      entry_key: entryKey,
      payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,category,source,entry_key' })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteAllVillaEntries(userId) {
  const client = requireSupabase()
  const { error } = await client
    .from('villa_entries')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

export async function fetchVillaEntries({ userId, category, source, limit = 100 } = {}) {
  const client = requireSupabase()
  let query = client
    .from('villa_entries')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (Array.isArray(category) && category.length > 0) {
    query = query.in('category', category)
  } else if (category) {
    query = query.eq('category', category)
  }

  if (Array.isArray(source) && source.length > 0) {
    query = query.in('source', source)
  } else if (source) {
    query = query.eq('source', source)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

import { fetchVillaEntries, requireSupabase, upsertProfile, upsertVillaEntry } from './supabase'

function todayKey() {
  return new Date().toDateString()
}

export async function syncProfile(profile) {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return null

  return upsertProfile({
    id: data.user.id,
    email: data.user.email || '',
    displayName: profile.displayName || 'Traveller',
    avatarConfig: profile.avatarConfig || {},
  }).catch(() => null)
}

export async function syncEntry({ category, source, payload, entryKey, entryDate }) {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return null

  return upsertVillaEntry({
    userId: data.user.id,
    category,
    source,
    payload,
    entryKey,
    entryDate: entryDate || todayKey(),
  }).catch(() => null)
}

export async function fetchEntries({ category, source, limit } = {}) {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return []

  return fetchVillaEntries({
    userId: data.user.id,
    category,
    source,
    limit,
  }).catch(() => [])
}

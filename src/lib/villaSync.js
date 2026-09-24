import { fetchVillaEntries, requireSupabase, upsertProfile, upsertVillaEntry } from './supabase'
import { trackEvent } from './activityTracking'

const PENDING_KEY = 'ri_pending_sync'

// Maps a villa_entries `category` to the villa/page it's saved from, so the
// researcher dashboard can group usage by villa without every call site
// having to know or pass that itself. `assessment` maps to mood-diary since
// Emotion Scales is only ever reached from the Mood Diary Centre.
const CATEGORY_TO_VILLA = {
  concierge: 'concierge',
  mood: 'mood-diary',
  journal: 'mood-diary',
  assessment: 'mood-diary',
  wellness: 'wellness',
  inspiration: 'inspiration',
}

function todayKey() {
  return new Date().toDateString()
}

function readPending() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]')
  } catch {
    return []
  }
}

function writePending(list) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — nothing to do
  }
}

function queuePending(entry) {
  const list = readPending()
  // Replace any queued write for the same (category, source, entryKey) so we
  // only ever retry the latest version of that entry.
  const next = list.filter(item => !(
    item.category === entry.category &&
    item.source === entry.source &&
    item.entryKey === entry.entryKey
  ))
  next.push(entry)
  writePending(next)
}

export async function syncProfile(profile) {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return { ok: false, error: error || new Error('Not signed in') }

  try {
    const result = await upsertProfile({
      id: data.user.id,
      email: data.user.email || '',
      displayName: profile.displayName || 'Traveller',
      avatarConfig: profile.avatarConfig || {},
    })
    return { ok: true, data: result }
  } catch (err) {
    console.error('syncProfile failed', err)
    return { ok: false, error: err }
  }
}

export async function syncEntry({ category, source, payload, entryKey, entryDate }) {
  const entry = { category, source, payload, entryKey, entryDate: entryDate || todayKey() }

  // Count the click itself, independent of whether the write below succeeds —
  // the participant still did the thing, and this covers ~15 already-synced
  // actions (mood save, journal save, assessment submit, sleep log, etc.)
  // from this single hook instead of touching every component.
  trackEvent('feature_submit', { villa: CATEGORY_TO_VILLA[category], feature: source })

  let client
  try {
    client = requireSupabase()
  } catch (err) {
    queuePending(entry)
    return { ok: false, error: err }
  }

  const { data, error: authError } = await client.auth.getUser()
  if (authError || !data.user) {
    queuePending(entry)
    return { ok: false, error: authError || new Error('Not signed in') }
  }

  try {
    const result = await upsertVillaEntry({ userId: data.user.id, ...entry })
    return { ok: true, data: result }
  } catch (err) {
    console.error('syncEntry failed, queued for retry', err)
    queuePending(entry)
    return { ok: false, error: err }
  }
}

// Retries any writes that previously failed (e.g. fired before the session
// finished hydrating, or a transient network error). Call this on app load,
// on regaining focus/network, and right after login.
export async function flushPendingSync() {
  const pending = readPending()
  if (pending.length === 0) return { ok: true, flushed: 0 }

  let client
  try {
    client = requireSupabase()
  } catch {
    return { ok: false, flushed: 0 }
  }

  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return { ok: false, flushed: 0 }

  const stillFailing = []
  let flushed = 0

  for (const entry of pending) {
    try {
      await upsertVillaEntry({ userId: data.user.id, ...entry })
      flushed += 1
    } catch (err) {
      console.error('flushPendingSync: entry still failing', err)
      stillFailing.push(entry)
    }
  }

  writePending(stillFailing)
  return { ok: stillFailing.length === 0, flushed }
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

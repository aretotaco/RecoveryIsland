import { insertActivityEvent, requireSupabase } from './supabase'

// Lightweight, append-only usage analytics for the researcher dashboard:
// villa visits, logins, and feature saves/clicks. Deliberately separate from
// villaSync's pending queue (different table, different failure semantics —
// losing an occasional click event is fine, losing a mood entry isn't) but
// mirrors the same offline-resilient shape so a flaky connection doesn't
// silently drop data.
const PENDING_KEY = 'ri_pending_events'

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

function queuePending(event) {
  const list = readPending()
  list.push(event)
  // Cap the queue so a long offline stretch can't grow this unbounded.
  writePending(list.slice(-200))
}

// Fire-and-forget: never throws into the caller, never blocks the UI.
export async function trackEvent(eventType, { villa, feature, metadata } = {}) {
  const event = { eventType, villa, feature, metadata }

  let client
  try {
    client = requireSupabase()
  } catch {
    queuePending(event)
    return
  }

  try {
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) {
      queuePending(event)
      return
    }

    await insertActivityEvent({ userId: data.user.id, ...event })
  } catch (err) {
    console.error('trackEvent failed, queued for retry', err)
    queuePending(event)
  }
}

export async function flushPendingEvents() {
  const pending = readPending()
  if (pending.length === 0) return

  let client
  try {
    client = requireSupabase()
  } catch {
    return
  }

  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return

  const stillFailing = []

  for (const event of pending) {
    try {
      await insertActivityEvent({ userId: data.user.id, ...event })
    } catch (err) {
      console.error('flushPendingEvents: event still failing', err)
      stillFailing.push(event)
    }
  }

  writePending(stillFailing)
}

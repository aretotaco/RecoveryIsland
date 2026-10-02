import { useEffect, useRef } from 'react'
import { fetchEntries, syncEntry } from './villaSync'
import { trackEvent } from './activityTracking'

// The six villas that count towards the Concierge "Your progress" card.
// AI Companion is left out while it's `comingSoon` — it can't be visited.
export const PROGRESS_VILLAS = [
  '/concierge',
  '/mood-diary',
  '/mindfulness',
  '/relaxation',
  '/wellness',
  '/inspiration',
]

// Stored alongside the rest of the concierge state. Never reset by date —
// once a villa has been explored it stays explored. It's also synced to
// Supabase so the progress survives sign-out (which clears ri_* keys).
const CONCIERGE_KEY = 'ri_concierge_v2'
const PROGRESS_EVENT = 'ri-villa-progress'

function readConcierge() {
  try { return JSON.parse(localStorage.getItem(CONCIERGE_KEY) || 'null') || {} } catch { return {} }
}

function writeExplored(explored) {
  try { localStorage.setItem(CONCIERGE_KEY, JSON.stringify({ ...readConcierge(), explored })) } catch {}
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: explored }))
}

export function loadExplored() {
  const explored = readConcierge().explored
  return Array.isArray(explored) ? explored.filter(p => PROGRESS_VILLAS.includes(p)) : []
}

export function markVillaExplored(path) {
  if (!PROGRESS_VILLAS.includes(path)) return
  const current = loadExplored()
  if (current.includes(path)) return

  const explored = [...current, path]
  writeExplored(explored)
  trackEvent('villa_explored', { villa: path.slice(1), feature: 'first-interaction' })
  syncEntry({
    category: 'concierge',
    source: 'villa-progress',
    entryKey: 'explored',
    payload: { explored, path },
  })
}

// Merge in progress saved on the server (e.g. from before a sign-out or on
// another device). Resolves to the merged list.
export async function restoreExplored() {
  const rows = await fetchEntries({ category: 'concierge', source: 'villa-progress', limit: 1 }).catch(() => [])
  const remote = Array.isArray(rows[0]?.payload?.explored) ? rows[0].payload.explored : []
  const local = loadExplored()
  const merged = PROGRESS_VILLAS.filter(p => local.includes(p) || remote.includes(p))
  if (merged.length !== local.length) writeExplored(merged)
  return merged
}

export function onExploredChange(cb) {
  const handler = e => cb(e.detail)
  window.addEventListener(PROGRESS_EVENT, handler)
  return () => window.removeEventListener(PROGRESS_EVENT, handler)
}

// Attach the returned ref to a villa's main content. The villa counts as
// explored on the first real interaction inside it — a click/tap, typing,
// playing a video, or clicking into an embedded (YouTube) iframe. Simply
// opening the page or using the back/nav buttons doesn't count.
export function useVillaExplored(path) {
  const ref = useRef(null)

  useEffect(() => {
    if (loadExplored().includes(path)) return undefined

    const inside = target => ref.current && target instanceof Node && ref.current.contains(target)
    const done = () => { markVillaExplored(path); cleanup() }
    const onInteract = e => { if (inside(e.target)) done() }
    // Clicks inside a cross-origin iframe never reach the page; the window
    // losing focus to that iframe is the standard way to detect them.
    const onBlur = () => setTimeout(() => {
      const el = document.activeElement
      if (el?.tagName === 'IFRAME' && inside(el)) done()
    }, 0)

    const events = ['pointerdown', 'keydown', 'input', 'play']
    events.forEach(type => document.addEventListener(type, onInteract, true))
    window.addEventListener('blur', onBlur)
    function cleanup() {
      events.forEach(type => document.removeEventListener(type, onInteract, true))
      window.removeEventListener('blur', onBlur)
    }
    return cleanup
  }, [path])

  return ref
}

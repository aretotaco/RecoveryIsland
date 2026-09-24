import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchEntries, syncEntry } from '../lib/villaSync'

function readLS(k, fb) { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fb } catch { return fb } }
function todayKey() { return new Date().toDateString() }

const AFFIRMATIONS = [
  { category: 'Morning', text: 'Today is a new beginning. I welcome it with an open heart.' },
  { category: 'Morning', text: 'I give myself permission to move slowly and still move forward.' },
  { category: 'Morning', text: 'I do not need to have it all figured out to take one small step today.' },
  { category: 'Morning', text: 'I choose to be present in this moment, just as it is.' },
  { category: 'Self-Worth', text: 'I am worthy of love — not because of what I achieve, but because I exist.' },
  { category: 'Self-Worth', text: 'I am enough, exactly as I am right now.' },
  { category: 'Self-Worth', text: 'My worth is not determined by my productivity or my struggles.' },
  { category: 'Self-Worth', text: 'I deserve the same compassion I would give a friend.' },
  { category: 'Healing', text: 'Healing is not linear, and neither am I. That is okay.' },
  { category: 'Healing', text: 'I honour the progress I cannot yet see.' },
  { category: 'Healing', text: 'I am allowed to take up space in my own life.' },
  { category: 'Healing', text: 'I release the pressure to be fully healed right now.' },
  { category: 'Strength', text: 'I have survived every difficult day before this one.' },
  { category: 'Strength', text: 'I carry more resilience than I give myself credit for.' },
  { category: 'Strength', text: 'This feeling is temporary. I am not.' },
  { category: 'Strength', text: 'I am becoming someone I am proud of — one day at a time.' },
]

const GOAL_PHASES = [
  {
    number: '01',
    heading: 'Set Your Intention',
    items: [
      'Choose one goal at a time — not five. One focused step beats scattered effort.',
      'Make it specific: "Go for a 10-minute walk on Tuesday" beats "exercise more".',
      'Ask yourself: is this goal from fear, or from hope? Aim for hope.',
      'Write it down. Naming your intention out loud makes it real.',
    ]
  },
  {
    number: '02',
    heading: 'Build the Habit',
    items: [
      'Pair your goal with something you already do — stack new habits onto existing ones.',
      'Start smaller than feels necessary. Tiny and consistent outlasts big and irregular.',
      "Track progress lightly — celebrate streaks, but don't let missing one end everything.",
      'Tell one person you trust. Accountability is a gift, not a burden.',
    ]
  },
  {
    number: '03',
    heading: 'When You Fall Off Track',
    items: [
      'Missing a day is normal. Missing a week is normal. What matters is coming back.',
      'Ask: what made this hard? Change the plan, not your opinion of yourself.',
      '"If I miss a day, then I will restart the next morning — without guilt."',
      'Progress is rarely a straight line. Trust the direction, not the pace.',
    ]
  }
]

const GRATITUDE_PROMPTS = [
  'Name three things that brought you even a moment of peace today.',
  'Who is someone — past or present — who believed in you? What would you want to say to them?',
  'What is one thing your body did today that you can appreciate, however small?',
  'What is a challenge you\'ve faced that has quietly shaped who you are?',
  'What simple pleasure did you experience today — a taste, a sound, a texture, a colour?',
  'What is one thing about yourself you are grateful for, right now in this moment?',
  'Notice something beautiful in your environment right now. Sit with it for 30 seconds.',
]

const AFFIRMATION_CATEGORIES = ['All', ...new Set(AFFIRMATIONS.map(a => a.category)), 'Favourites']

export function AffirmationDeck() {
  const [category, setCategory] = useState('All')
  const [index, setIndex] = useState(0)
  const [favourites, setFavourites] = useState(() => readLS('ri_affirmation_favourites', []))

  const list = category === 'All'
    ? AFFIRMATIONS
    : category === 'Favourites'
      ? AFFIRMATIONS.filter(a => favourites.includes(a.text))
      : AFFIRMATIONS.filter(a => a.category === category)

  const current = list[Math.min(index, Math.max(list.length - 1, 0))]
  const isFavourite = current ? favourites.includes(current.text) : false

  function changeCategory(cat) {
    setCategory(cat)
    setIndex(0)
  }

  const prev = () => setIndex(i => (i - 1 + list.length) % list.length)
  const next = () => setIndex(i => (i + 1) % list.length)
  const shuffle = () => {
    if (list.length < 2) return
    let n
    do { n = Math.floor(Math.random() * list.length) } while (n === index)
    setIndex(n)
  }

  function toggleFavourite() {
    if (!current) return
    const next = isFavourite ? favourites.filter(t => t !== current.text) : [...favourites, current.text]
    setFavourites(next)
    try { localStorage.setItem('ri_affirmation_favourites', JSON.stringify(next)) } catch { /* ignore */ }
  }

  return (
    <div className="affirmation-deck">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {AFFIRMATION_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => changeCategory(cat)} style={{
            padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontSize: '0.72rem',
            border: category === cat ? '1.5px solid var(--villa-color)' : '1.5px solid var(--ri-input-border)',
            background: category === cat ? 'rgba(249,115,22,0.15)' : 'var(--ri-card-bg)',
            color: category === cat ? 'var(--villa-color-light)' : 'var(--ri-text-secondary)',
          }}>
            {cat === 'Favourites' ? `\u2661 ${cat}` : cat}
          </button>
        ))}
      </div>

      {current ? (
        <>
          <span className="affirmation-category">{current.category}</span>
          <p className="affirmation-text" key={current.text}>"{current.text}"</p>
          <div className="affirmation-nav">
            <button className="affirmation-arrow" onClick={prev} aria-label="Previous">←</button>
            <button onClick={toggleFavourite} aria-label="Toggle favourite" style={{
              background: isFavourite ? 'rgba(249,115,22,0.2)' : 'var(--ri-card-border)',
              border: isFavourite ? '1px solid var(--villa-color)' : '1px solid var(--ri-input-border)',
              color: isFavourite ? 'var(--villa-color-light)' : 'white',
              borderRadius: '50%', width: 36, height: 36, fontSize: 15, cursor: 'pointer',
            }}>
              {isFavourite ? '\u2665' : '\u2661'}
            </button>
            <button className="affirmation-shuffle" onClick={shuffle}>✦ Shuffle</button>
            <button className="affirmation-arrow" onClick={next} aria-label="Next">→</button>
          </div>
          <p className="affirmation-count">{index + 1} / {list.length}</p>
        </>
      ) : (
        <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.85rem', padding: '10px 0' }}>
          No favourites yet — tap the heart on an affirmation to save it here.
        </p>
      )}
    </div>
  )
}

export function GoalStepper() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(0)
  const [intention, setIntention] = useState(() => readLS('ri_goal_intention', ''))
  const [intentionInput, setIntentionInput] = useState(() => readLS('ri_goal_intention', ''))
  const [checked, setChecked] = useState(() => readLS('ri_goal_progress', {}))

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    fetchEntries({ category: 'inspiration', source: 'goal-tracker', limit: 5 }).then(rows => {
      if (!active) return
      const latest = rows[0]?.payload
      if (latest) {
        setIntention(latest.intention || '')
        setIntentionInput(latest.intention || '')
        setChecked(latest.checked || {})
        try { localStorage.setItem('ri_goal_intention', JSON.stringify(latest.intention || '')) } catch { /* ignore */ }
        try { localStorage.setItem('ri_goal_progress', JSON.stringify(latest.checked || {})) } catch { /* ignore */ }
      }
    })
    return () => { active = false }
  }, [isAuthenticated])

  function persistAndSync(nextIntention, nextChecked) {
    try { localStorage.setItem('ri_goal_intention', JSON.stringify(nextIntention)) } catch { /* ignore */ }
    try { localStorage.setItem('ri_goal_progress', JSON.stringify(nextChecked)) } catch { /* ignore */ }
    syncEntry({
      category: 'inspiration',
      source: 'goal-tracker',
      entryKey: 'current',
      entryDate: todayKey(),
      payload: { intention: nextIntention, checked: nextChecked },
    })
  }

  function saveIntention() {
    setIntention(intentionInput.trim())
    persistAndSync(intentionInput.trim(), checked)
  }

  function toggleItem(phaseIndex, itemIndex) {
    const key = `${phaseIndex}-${itemIndex}`
    const next = { ...checked, [key]: !checked[key] }
    setChecked(next)
    persistAndSync(intention, next)
  }

  const totalItems = GOAL_PHASES.reduce((sum, p) => sum + p.items.length, 0)
  const doneItems = Object.values(checked).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 14, background: 'var(--ri-recessed-bg)', border: '1px solid var(--ri-card-border)' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--ri-text-secondary)' }}>My one intention right now</p>
        <input
          value={intentionInput}
          onChange={e => setIntentionInput(e.target.value)}
          placeholder="e.g. Go for a 10-minute walk on Tuesdays"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ri-input-border)', background: 'var(--ri-input-bg)', color: 'var(--ri-text-primary)' }}
        />
        <button onClick={saveIntention} style={{ alignSelf: 'flex-start', padding: '8px 16px', borderRadius: 999, border: 'none', background: 'var(--villa-color)', color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          Save intention
        </button>
        {intention && <p style={{ fontSize: '0.82rem', color: 'var(--ri-text-secondary)', fontStyle: 'italic' }}>Current intention: "{intention}"</p>}
      </div>

      {doneItems > 0 && (
        <p style={{ fontSize: '0.78rem', color: 'var(--ri-text-muted)', textAlign: 'center' }}>
          {doneItems} of {totalItems} steps checked off across the phases below.
        </p>
      )}

      <div className="goal-stepper">
        {GOAL_PHASES.map((phase, i) => (
          <div key={i} className={`goal-phase ${open === i ? 'goal-phase--open' : ''}`}>
            <button className="goal-phase-header" onClick={() => setOpen(open === i ? -1 : i)}>
              <span className="goal-phase-number">{phase.number}</span>
              <span className="goal-phase-title">{phase.heading}</span>
              <span className="goal-phase-chevron">{open === i ? '▲' : '▼'}</span>
            </button>
            {open === i && (
              <ul className="goal-phase-items" style={{ listStyle: 'none', paddingLeft: 0 }}>
                {phase.items.map((item, ii) => {
                  const key = `${i}-${ii}`
                  const isChecked = !!checked[key]
                  return (
                    <li key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }} onClick={() => toggleItem(i, ii)}>
                      <span style={{
                        flexShrink: 0, marginTop: 2, width: 16, height: 16, borderRadius: 4,
                        border: isChecked ? '1.5px solid var(--villa-color)' : '1.5px solid var(--ri-text-muted)',
                        background: isChecked ? 'var(--villa-color)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white',
                      }}>
                        {isChecked ? '✓' : ''}
                      </span>
                      <span style={{ textDecoration: isChecked ? 'line-through' : 'none', opacity: isChecked ? 0.6 : 1 }}>{item}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GratitudePromptPicker() {
  const { isAuthenticated } = useAuth()
  const [index, setIndex] = useState(0)
  const [reflection, setReflection] = useState('')
  const [entries, setEntries] = useState(() => readLS('ri_gratitude_entries', []))
  const next = () => setIndex(i => (i + 1) % GRATITUDE_PROMPTS.length)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    fetchEntries({ category: 'inspiration', source: 'gratitude-practice', limit: 30 }).then(rows => {
      if (!active) return
      const remoteEntries = rows
        .map(r => r.payload)
        .filter(p => p?.text)
        .sort((a, b) => (b.ts || 0) - (a.ts || 0))
        .slice(0, 5)
      if (remoteEntries.length > 0) {
        setEntries(remoteEntries)
        try { localStorage.setItem('ri_gratitude_entries', JSON.stringify(remoteEntries)) } catch { /* ignore */ }
      }
    })
    return () => { active = false }
  }, [isAuthenticated])

  function saveReflection() {
    if (!reflection.trim()) return
    const entry = { id: Date.now(), ts: Date.now(), prompt: GRATITUDE_PROMPTS[index], text: reflection.trim() }
    const nextEntries = [entry, ...entries].slice(0, 5)
    setEntries(nextEntries)
    try { localStorage.setItem('ri_gratitude_entries', JSON.stringify(nextEntries)) } catch { /* ignore */ }
    syncEntry({
      category: 'inspiration',
      source: 'gratitude-practice',
      entryKey: `${todayKey()}-${entry.id}`,
      payload: entry,
    })
    setReflection('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="gratitude-prompt">
        <p className="gratitude-label">Today's Prompt</p>
        <p className="gratitude-text" key={index}>{GRATITUDE_PROMPTS[index]}</p>
        <div className="gratitude-footer">
          <span className="gratitude-count">{index + 1} of {GRATITUDE_PROMPTS.length}</span>
          <button className="gratitude-next" onClick={next}>Next Prompt →</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Write a short reflection to this prompt..."
          rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ri-input-border)', background: 'var(--ri-input-bg)', color: 'var(--ri-text-primary)', resize: 'vertical' }}
        />
        <button onClick={saveReflection} style={{ alignSelf: 'flex-start', padding: '9px 16px', borderRadius: 999, border: 'none', background: 'var(--villa-color)', color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          Save reflection
        </button>
      </div>

      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--ri-text-muted)' }}>Recent reflections</p>
          {entries.map(e => (
            <div key={e.id} style={{ padding: 12, borderRadius: 12, background: 'var(--ri-recessed-bg)', border: '1px solid var(--ri-card-border)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--villa-color-light)', marginBottom: 4 }}>{e.prompt}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ri-text-primary)', lineHeight: 1.5 }}>{e.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

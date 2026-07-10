import { useState } from 'react'
import VillaLayout from '../components/VillaLayout'
import { syncEntry } from '../lib/villaSync'

const ROUTINE_ITEMS = {
  morning: [
    { id: 'water',     label: 'Drink a glass of water',      emoji: '\u{1F4A7}' },
    { id: 'stretch',   label: '5-min morning stretch',        emoji: '\u{1F646}' },
    { id: 'journal',   label: 'Write 3 intentions',           emoji: '\u{270D}' },
    { id: 'breakfast', label: 'Nourishing breakfast',         emoji: '\u{1F963}' },
    { id: 'sunlight',  label: 'Step outside for sunlight',    emoji: '\u{2600}' },
    { id: 'breathe',   label: 'Breathing exercise',           emoji: '\u{1F32C}' },
    { id: 'gratitude', label: 'Note one thing to appreciate', emoji: '\u{1F338}' },
    { id: 'noscreen',  label: 'No phone for 30 min',          emoji: '\u{1F4F5}' },
  ],
  evening: [
    { id: 'unwind',    label: 'Start winding down',           emoji: '\u{1F319}' },
    { id: 'noscreen2', label: 'Put phone down by 9pm',        emoji: '\u{1F4F5}' },
    { id: 'reflect',   label: 'Reflect on the day',           emoji: '\u{1F4AD}' },
    { id: 'tea',       label: 'Herbal tea',                   emoji: '\u{1F375}' },
    { id: 'stretch2',  label: 'Gentle evening stretch',       emoji: '\u{1F9D8}' },
    { id: 'read',      label: 'Read for 15 minutes',          emoji: '\u{1F4DA}' },
    { id: 'grateful2', label: "Write one thing you're proud of", emoji: '✨' },
    { id: 'sleep',     label: 'Consistent sleep time',        emoji: '\u{1F634}' },
  ],
}

const SLEEP_QUALITY = [
  { val: 3, label: 'Great', emoji: '\u{1F634}', color: '#10b981' },
  { val: 2, label: 'Okay',  emoji: '\u{1F610}', color: '#f59e0b' },
  { val: 1, label: 'Poor',  emoji: '\u{1F635}', color: '#ef4444' },
]

const MOVEMENT_PRESETS = [
  { id: 'walk', label: 'Walk / Stroll', emoji: '\u{1F6B6}', mins: 15, burn: 55 },
  { id: 'stretch', label: 'Stretching', emoji: '\u{1F646}', mins: 10, burn: 28 },
  { id: 'yoga', label: 'Yoga', emoji: '\u{1F9D8}', mins: 20, burn: 65 },
  { id: 'run', label: 'Run / Jog', emoji: '\u{1F3C3}', mins: 20, burn: 180 },
  { id: 'swim', label: 'Swimming', emoji: '\u{1F3CA}', mins: 30, burn: 220 },
  { id: 'dance', label: 'Dance', emoji: '\u{1F483}', mins: 15, burn: 90 },
  { id: 'gym', label: 'Strength Training', emoji: '\u{1F3CB}', mins: 30, burn: 170 },
  { id: 'cycle', label: 'Cycling', emoji: '\u{1F6B4}', mins: 20, burn: 140 },
]

const MEAL_MOOD_TIPS = [
  { mood: 'Anxious', emoji: '\u{1F630}', color: '#8b5cf6', foods: ['Magnesium-rich foods like spinach, almonds, and dark chocolate', 'Chamomile tea or warm water', 'Omega-3s like salmon, walnuts, and chia seeds'], why: 'These choices support nervous-system regulation and reduce stress spikes.' },
  { mood: 'Low / Sad', emoji: '\u{1F614}', color: '#6366f1', foods: ['Eggs, oats, banana, and yoghurt', 'Leafy greens and colourful fruit', 'Warm, steady meals with complex carbs'], why: 'Balanced carbs and protein help steadier energy and mood.' },
  { mood: 'Fatigued', emoji: '\u{1F634}', color: '#f59e0b', foods: ['Iron-rich foods like lentils and spinach', 'B12 sources like eggs and dairy', 'Hydrating meals and plenty of water'], why: 'Fatigue often gets worse with dehydration and missed meals.' },
  { mood: 'Stressed', emoji: '\u{1F624}', color: '#ef4444', foods: ['Vitamin C foods like citrus and berries', 'Pumpkin seeds and black beans', 'Herbal tea and simple, easy-to-digest meals'], why: 'Gentle food choices can help your body recover from stress.' },
  { mood: 'Unfocused', emoji: '\u{1F300}', color: '#10b981', foods: ['Blueberries, avocado, eggs, and whole grains', 'Protein at breakfast', 'Water before caffeine'], why: 'Stable blood sugar and hydration improve concentration.' },
]

function todayKey() { return new Date().toDateString() }
function readLS(k, fb) { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fb } catch { return fb } }

function estimateBurn(minutes, label) {
  const preset = MOVEMENT_PRESETS.find(item => item.label === label)
  const base = preset ? preset.burn / preset.mins : 5
  return Math.round(minutes * base)
}

const SELECT_STYLE = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(15,23,42,0.9)',
  color: 'rgba(255,255,255,0.92)',
}

const SELECT_OPTION_STYLE = { color: '#111827', background: '#ffffff' }

function MovementTracker() {
  const key = `ri_movement_${todayKey()}`
  const [state, setState] = useState(() => {
    const stored = readLS(key, null)
    if (Array.isArray(stored)) return { preset: stored, custom: [] }
    return stored || { preset: [], custom: [] }
  })
  const [customLabel, setCustomLabel] = useState('')
  const [customMinutes, setCustomMinutes] = useState(20)
  const [customIntensity, setCustomIntensity] = useState('moderate')

  function persist(next) {
    setState(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
  }

  function togglePreset(id) {
    const nextPreset = state.preset.includes(id) ? state.preset.filter(item => item !== id) : [...state.preset, id]
    const nextState = { ...state, preset: nextPreset }
    persist(nextState)
    syncEntry({
      category: 'wellness',
      source: 'movement-tracker',
      entryKey: todayKey(),
      payload: nextState,
    })
  }

  function addCustomActivity() {
    const label = customLabel.trim()
    if (!label) return
    const minutes = Math.max(5, Number(customMinutes) || 0)
    const entry = { id: Date.now(), label, minutes, intensity: customIntensity }
    const nextState = { ...state, custom: [...state.custom, entry] }
    persist(nextState)
    syncEntry({
      category: 'wellness',
      source: 'movement-tracker',
      entryKey: `${todayKey()}-${entry.id}`,
      payload: entry,
    })
    setCustomLabel('')
    setCustomMinutes(20)
    setCustomIntensity('moderate')
  }

  const presetMinutes = state.preset.reduce((sum, id) => sum + (MOVEMENT_PRESETS.find(m => m.id === id)?.mins || 0), 0)
  const customMinutesTotal = state.custom.reduce((sum, entry) => sum + entry.minutes, 0)
  const totalMins = presetMinutes + customMinutesTotal
  const estimatedBurn = state.preset.reduce((sum, id) => {
    const item = MOVEMENT_PRESETS.find(m => m.id === id)
    return sum + (item ? item.burn : 0)
  }, 0) + state.custom.reduce((sum, entry) => sum + estimateBurn(entry.minutes, entry.label), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
        {MOVEMENT_PRESETS.map(m => {
          const active = state.preset.includes(m.id)
          return (
            <button key={m.id} onClick={() => togglePreset(m.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '12px 8px', borderRadius: 12,
              border: active ? '1.5px solid rgba(74,222,128,0.6)' : '1.5px solid rgba(255,215,150,0.15)',
              background: active ? 'rgba(74,222,128,0.12)' : 'rgba(255,245,220,0.04)',
              cursor: 'pointer', transition: 'all 0.18s', color: 'white',
            }}>
              <span style={{ fontSize: 22 }}>{active ? '✅' : m.emoji}</span>
              <span style={{ fontSize: '0.78rem', textAlign: 'center', color: active ? 'rgba(74,222,128,0.9)' : 'rgba(255,240,200,0.6)' }}>{m.label}</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,240,200,0.35)' }}>{m.mins} min · ~{m.burn} cal</span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gap: 10, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,240,200,0.5)' }}>Add any activity, even if it is not on the list.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.9fr auto', gap: 8 }}>
          <input value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="Walk to class, football, dance practice..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
          <input type="number" min="5" value={customMinutes} onChange={e => setCustomMinutes(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
          <select value={customIntensity} onChange={e => setCustomIntensity(e.target.value)} style={SELECT_STYLE}>
            <option value="light" style={SELECT_OPTION_STYLE}>Light</option>
            <option value="moderate" style={SELECT_OPTION_STYLE}>Moderate</option>
            <option value="vigorous" style={SELECT_OPTION_STYLE}>Vigorous</option>
          </select>
          <button onClick={addCustomActivity} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', cursor: 'pointer' }}>Add</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state.custom.map(entry => (
          <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: '10px 12px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)', color: 'rgba(255,240,200,0.8)' }}>
            <span>{entry.label} · {entry.minutes} min</span>
            <span style={{ color: 'rgba(74,222,128,0.95)' }}>~{estimateBurn(entry.minutes, entry.label)} cal</span>
          </div>
        ))}
      </div>

      {totalMins > 0 && (
        <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: 'rgba(74,222,128,0.85)', textAlign: 'center' }}>
          {totalMins} minutes of movement logged today, with an estimated {estimatedBurn} calories burned.
        </div>
      )}
    </div>
  )
}

function NourishmentGuide() {
  const [selected, setSelected] = useState(null)
  const [mealText, setMealText] = useState('')
  const [mealMoment, setMealMoment] = useState('breakfast')
  const [reflection, setReflection] = useState('')
  const [mealLogs, setMealLogs] = useState(() => readLS(`ri_meals_${todayKey()}`, []))
  const tip = selected !== null ? MEAL_MOOD_TIPS[selected] : null

  function saveMeal() {
    if (!mealText.trim()) return
    const entry = {
      id: Date.now(),
      text: mealText.trim(),
      moment: mealMoment,
      mood: tip?.mood || 'Neutral',
      reflection: reflection.trim(),
      ts: Date.now(),
    }
    const next = [entry, ...mealLogs].slice(0, 6)
    setMealLogs(next)
    try { localStorage.setItem(`ri_meals_${todayKey()}`, JSON.stringify(next)) } catch {}
    syncEntry({
      category: 'wellness',
      source: 'nourishment-guide',
      entryKey: `${todayKey()}-${entry.id}`,
      payload: { text: entry.text, moment: entry.moment, mood: entry.mood, reflection: entry.reflection },
    })
    setMealText('')
    setMealMoment('breakfast')
    setReflection('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,240,200,0.5)' }}>Select a mood to get gentle food ideas, then note what you ate and how it felt in your body. No calorie guesswork.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {MEAL_MOOD_TIPS.map((t, i) => (
          <button key={i} onClick={() => setSelected(selected === i ? null : i)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999,
            border: selected === i ? `1.5px solid ${t.color}` : '1.5px solid rgba(255,215,150,0.15)',
            background: selected === i ? `${t.color}20` : 'rgba(255,245,220,0.04)',
            color: selected === i ? 'white' : 'rgba(255,240,200,0.65)', cursor: 'pointer',
            fontSize: '0.82rem', transition: 'all 0.18s',
          }}>
            <span>{t.emoji}</span> {t.mood}
          </button>
        ))}
      </div>
      {tip && (
        <div style={{ background: `${tip.color}12`, border: `1px solid ${tip.color}40`, borderRadius: 14, padding: '16px 18px' }}>
          <p style={{ fontSize: '0.78rem', color: tip.color, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Foods that help when feeling {tip.mood.toLowerCase()}
          </p>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tip.foods.map((f, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'rgba(255,240,200,0.8)', lineHeight: 1.5 }}>{f}</li>
            ))}
          </ul>
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, fontSize: '0.78rem', color: 'rgba(255,240,200,0.5)', fontStyle: 'italic' }}>
            {tip.why}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <input value={mealText} onChange={e => setMealText(e.target.value)} placeholder="What did you eat or drink?" style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <select value={mealMoment} onChange={e => setMealMoment(e.target.value)} style={SELECT_STYLE}>
              <option value="breakfast" style={SELECT_OPTION_STYLE}>Breakfast</option>
              <option value="lunch" style={SELECT_OPTION_STYLE}>Lunch</option>
              <option value="dinner" style={SELECT_OPTION_STYLE}>Dinner</option>
              <option value="snack" style={SELECT_OPTION_STYLE}>Snack</option>
            </select>
            <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="How did it leave you feeling afterwards?" rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white', resize: 'vertical' }} />
          </div>
          <button onClick={saveMeal} style={{ padding: '11px 14px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #f97316, #fb7185)', color: 'white', cursor: 'pointer' }}>
            Save nourishment check-in
          </button>
        </div>
      </div>

      {mealLogs.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,240,200,0.5)' }}>Recent nourishment check-ins</p>
          {mealLogs.map(entry => (
            <div key={entry.id} style={{ display: 'grid', gap: 6, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ color: 'white', fontSize: '0.9rem', marginBottom: 4 }}>{entry.text}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,240,200,0.45)' }}>{entry.mood} · {entry.moment || 'meal'}</div>
              </div>
              {entry.reflection && <div style={{ color: 'rgba(255,240,200,0.7)', fontSize: '0.8rem', lineHeight: 1.6 }}>{entry.reflection}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RoutineBuilder() {
  const [tab, setTab] = useState('morning')
  const [selected, setSelected] = useState(() => readLS('ri_routine_morning', []))

  function toggleItem(id) {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    setSelected(next)
    try { localStorage.setItem(`ri_routine_${tab}`, JSON.stringify(next)) } catch {}
  }

  function switchTab(t) {
    setTab(t)
    setSelected(readLS(`ri_routine_${t}`, []))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {['morning', 'evening'].map(t => (
          <button key={t} onClick={() => switchTab(t)} style={{
            padding: '8px 20px', borderRadius: 999, cursor: 'pointer', fontSize: '0.85rem',
            border: tab === t ? '1.5px solid #f43f5e' : '1.5px solid rgba(255,215,150,0.15)',
            background: tab === t ? 'rgba(244,63,94,0.15)' : 'rgba(255,245,220,0.04)',
            color: tab === t ? '#fda4af' : 'rgba(255,240,200,0.55)', transition: 'all 0.18s',
          }}>
            {t === 'morning' ? 'Morning' : 'Evening'}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 8 }}>
        {ROUTINE_ITEMS[tab].map(item => {
          const on = selected.includes(item.id)
          return (
            <button key={item.id} onClick={() => toggleItem(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12,
              border: on ? '1.5px solid rgba(244,63,94,0.5)' : '1.5px solid rgba(255,215,150,0.12)',
              background: on ? 'rgba(244,63,94,0.1)' : 'rgba(255,245,220,0.03)',
              cursor: 'pointer', color: on ? '#fda4af' : 'rgba(255,240,200,0.6)',
              fontSize: '0.8rem', textAlign: 'left', transition: 'all 0.18s',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{on ? '✅' : item.emoji}</span>
              {item.label}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', color: 'rgba(253,164,175,0.85)', textAlign: 'center' }}>
          Your {tab} routine has {selected.length} {selected.length === 1 ? 'habit' : 'habits'}. Consistency is everything.
        </div>
      )}
    </div>
  )
}

function SleepTracker() {
  const key = `ri_sleep_${todayKey()}`
  const [entry, setEntry] = useState(() => readLS(key, null))
  const [hours, setHours] = useState(entry?.hours ?? 7)
  const [quality, setQuality] = useState(entry?.quality ?? null)
  const [saved, setSaved] = useState(!!entry)

  function save() {
    if (!quality) return
    const e = { hours, quality }
    setEntry(e)
    setSaved(true)
    try { localStorage.setItem(key, JSON.stringify(e)) } catch {}
    syncEntry({
      category: 'wellness',
      source: 'sleep-tracker',
      entryKey: todayKey(),
      payload: e,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {saved && entry ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 40 }}>{SLEEP_QUALITY.find(q => q.val === entry.quality)?.emoji}</span>
          <div>
            <p style={{ color: 'rgba(255,240,200,0.85)', fontSize: '0.95rem' }}>
              You logged <strong style={{ color: '#c4b5fd' }}>{entry.hours}h</strong> of <strong style={{ color: '#c4b5fd' }}>{SLEEP_QUALITY.find(q => q.val === entry.quality)?.label}</strong> sleep
            </p>
            <button onClick={() => setSaved(false)} style={{ marginTop: 6, background: 'none', border: '1px solid rgba(255,215,150,0.2)', borderRadius: 999, color: 'rgba(255,240,200,0.45)', fontSize: '0.75rem', padding: '4px 12px', cursor: 'pointer' }}>Update</button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,240,200,0.5)', marginBottom: 10 }}>Hours of sleep last night</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <input type="range" min="3" max="12" step="0.5" value={hours} onChange={e => setHours(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#8b5cf6' }} />
              <span style={{ color: '#c4b5fd', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', minWidth: 40, textAlign: 'right' }}>{hours}h</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,240,200,0.5)', marginBottom: 10 }}>Sleep quality</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {SLEEP_QUALITY.map(q => (
                <button key={q.val} onClick={() => setQuality(q.val)} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: '12px 8px', borderRadius: 12,
                  border: quality === q.val ? `1.5px solid ${q.color}` : '1.5px solid rgba(255,215,150,0.12)',
                  background: quality === q.val ? `${q.color}18` : 'rgba(255,245,220,0.04)',
                  cursor: 'pointer', color: quality === q.val ? q.color : 'rgba(255,240,200,0.55)',
                  fontSize: '0.8rem', transition: 'all 0.18s',
                }}>
                  <span style={{ fontSize: 22 }}>{q.emoji}</span>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
          {quality && (
            <button onClick={save} style={{ padding: '11px', borderRadius: 999, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', color: 'white', fontFamily: "'Jost', sans-serif", fontSize: '0.9rem', cursor: 'pointer' }}>
              Save Sleep Log
            </button>
          )}
        </>
      )}
      <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, fontSize: '0.78rem', color: 'rgba(255,240,200,0.45)', lineHeight: 1.6 }}>
        Adults need 7-9 hours. Consistent sleep times improve mood, focus, and resilience more than any supplement.
      </div>
    </div>
  )
}

export default function WellnessVilla() {
  return (
    <VillaLayout villa={{
      id: 5,
      name: 'Wellness Villa',
      emoji: '\u{1F49A}',
      color: '#f43f5e',
      colorLight: '#fda4af',
      tagline: 'Whole-person wellness -- mind, body, and soul in harmony.',
      sections: [
        {
          icon: '\u{1F3C3}',
          title: 'Movement Tracker',
          text: "Mindful movement is one of the most powerful things you can do for your mental health. Tick off what you've done today or add a custom activity if it is not on the list.",
          component: <MovementTracker />
        },
        {
          icon: '\u{1F957}',
          title: 'Nourishment & Mood',
          text: 'What you eat can shape your energy, focus, and comfort. Select a mood to discover supportive foods, then keep a realistic note-based nourishment log instead of fixed calorie guesses.',
          component: <NourishmentGuide />
        },
        {
          icon: '\u{1F4C5}',
          title: 'Routine Builder',
          text: 'Build a personalised morning or evening routine. Small consistent rituals reduce decision fatigue and create emotional stability.',
          component: <RoutineBuilder />
        },
        {
          icon: '\u{1F4A4}',
          title: 'Sleep Tracker',
          text: 'Sleep is the foundation of mental health. Log your sleep to build awareness of how rest shapes your mood and energy.',
          component: <SleepTracker />
        },
        {
          icon: '\u{1F4A7}',
          title: 'The Basics That Change Everything',
          text: "Before supplements, apps, or routines -- these fundamentals have the biggest impact: drink water before anything else each morning, spend 10 minutes in natural light daily, eat something warm and nourishing for breakfast, and protect the first and last 30 minutes of your day from screens.",
        }
      ]
    }} />
  )
}

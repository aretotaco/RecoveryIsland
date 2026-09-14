import { useEffect, useState } from 'react'
import VillaLayout from '../components/VillaLayout'
import { fetchEntries, syncEntry } from '../lib/villaSync'
import { useAuth } from '../context/AuthContext'

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

const HYDRATION_TARGET = 8

function hydrationStatus(cups) {
  const pct = cups / HYDRATION_TARGET
  if (pct >= 0.75) return { label: 'Great pace', emoji: '\u{1F7E2}', color: '#4ade80', border: 'rgba(74,222,128,0.4)', bg: 'rgba(74,222,128,0.12)' }
  if (pct >= 0.4) return { label: 'Getting there', emoji: '\u{1F7E1}', color: '#facc15', border: 'rgba(250,204,21,0.4)', bg: 'rgba(250,204,21,0.12)' }
  return { label: 'Drink up', emoji: '\u{1F534}', color: '#f87171', border: 'rgba(248,113,113,0.4)', bg: 'rgba(248,113,113,0.12)' }
}

const HYDRATION_TIPS = [
  { title: 'Signs you need more fluids', text: 'Headaches, tiredness, dizziness, and dark yellow urine are common early signs of mild dehydration.' },
  { title: 'Make water more appealing', text: 'Add lemon, cucumber, mint, or berries to plain water for natural flavour without added sugar.' },
  { title: 'Why it matters', text: 'Good hydration supports concentration, mood, digestion, and energy levels throughout the day.' },
]

const FACT_CARDS = [
  { id: 'f1', category: 'Nutrition', emoji: '\u{1F957}', front: 'How much of your plate should be fruit & veg?', back: 'Aim for about half your plate to be fruits and vegetables at each meal for fibre, vitamins, and minerals.' },
  { id: 'f2', category: 'Nutrition', emoji: '\u{1F525}', front: "What's the deal with calories?", back: 'Calories measure the energy in food. Needs vary by person, so focus on balanced meals rather than exact numbers.' },
  { id: 'f3', category: 'Nutrition', emoji: '\u{1FAD2}', front: 'Which fats are healthier choices?', back: 'Unsaturated fats like olive, canola, or sunflower oil support heart health better than frequent solid fats like butter or lard.' },
  { id: 'f4', category: 'Nutrition', emoji: '\u{1F373}', front: 'What does a healthy plate look like?', back: 'A simple guide: half vegetables & fruit, a quarter wholegrains, a quarter protein, plus water as your main drink.' },
  { id: 'f5', category: 'Hydration', emoji: '\u{1F4A7}', front: 'How much fluid do I actually need?', back: 'General guidance is around 6-8 cups (1.5-2L) daily, more if you are active or it is hot - plain water is best.' },
  { id: 'f6', category: 'Hydration', emoji: '\u{1F6A8}', front: "Signs you're not drinking enough", back: 'Headaches, fatigue, dizziness, and dark yellow urine are common early signs of mild dehydration.' },
  { id: 'f7', category: 'Hydration', emoji: '\u{1F34B}', front: 'Make water more appealing', back: 'Add slices of lemon, cucumber, mint, or berries to plain water for natural flavour without added sugar.' },
  { id: 'f8', category: 'Exercise', emoji: '\u{1F3C3}', front: 'What is MVPA?', back: 'Moderate-to-Vigorous Physical Activity - anything that raises your heart rate noticeably, from brisk walking to sport.' },
  { id: 'f9', category: 'Exercise', emoji: '\u{1F4C6}', front: 'How much movement is recommended weekly?', back: 'Roughly 150 minutes of moderate activity (or 75 minutes vigorous), spread across several days.' },
  { id: 'f10', category: 'Sleep', emoji: '\u{1F319}', front: 'What is sleep hygiene?', back: 'Habits that support good sleep: consistent bed/wake times, a dark cool room, and winding down without screens.' },
  { id: 'f11', category: 'Sleep', emoji: '\u{1F9D8}', front: 'Relaxation before bed?', back: 'Slow breathing, gentle stretching, or a warm caffeine-free drink can signal to your body that it is time to rest.' },
  { id: 'f12', category: 'Nutrition', emoji: '\u{1F373}', front: 'Why include protein at breakfast?', back: 'Protein at breakfast helps keep energy and focus more stable through the morning.' },
]

const QUIZ_QUESTIONS = [
  { id: 'q1', category: 'Nutrition', q: 'About how much of your plate should be fruits and vegetables?', options: ['A quarter', 'Half', 'All of it'], correct: 1, explain: 'Filling half your plate with fruits and vegetables is a simple way to boost fibre, vitamins, and minerals.' },
  { id: 'q2', category: 'Nutrition', q: 'Which of these is generally a heart-healthier fat for everyday cooking?', options: ['Butter', 'Olive oil', 'Lard'], correct: 1, explain: 'Unsaturated oils like olive or canola oil are considered healthier choices than solid saturated fats.' },
  { id: 'q3', category: 'Nutrition', q: "What best describes 'calories'?", options: ['A vitamin', 'A unit of energy in food', 'A type of protein'], correct: 1, explain: 'Calories measure the energy your body gets from food and drink.' },
  { id: 'q4', category: 'Hydration', q: 'About how many cups of fluid do most adults aim for daily?', options: ['2-3 cups', '6-8 cups', '15+ cups'], correct: 1, explain: 'Roughly 6-8 cups (about 1.5-2 litres) is a common general guideline, more if active or hot.' },
  { id: 'q5', category: 'Hydration', q: 'Which of these can be an early sign of mild dehydration?', options: ['Dark yellow urine', 'Clear skin', 'Increased appetite'], correct: 0, explain: 'Darker urine, headaches, and fatigue can all signal you need more fluids.' },
  { id: 'q6', category: 'Hydration', q: 'Which is a naturally sugar-free way to flavour water?', options: ['Soda syrup', 'Lemon or cucumber slices', 'Condensed milk'], correct: 1, explain: 'Fresh fruit, herbs, or cucumber add flavour without added sugar.' },
  { id: 'q7', category: 'Exercise', q: 'What does MVPA stand for?', options: ['Moderate-to-Vigorous Physical Activity', 'Muscle Volume Per Area', 'Maximum Vital Pulse Average'], correct: 0, explain: 'MVPA describes activity intense enough to raise your heart rate noticeably.' },
  { id: 'q8', category: 'Exercise', q: 'How many minutes of moderate activity per week is commonly recommended for adults?', options: ['About 30 minutes', 'About 150 minutes', 'About 500 minutes'], correct: 1, explain: 'Around 150 minutes of moderate activity (or 75 vigorous) weekly is a widely used guideline.' },
  { id: 'q9', category: 'Sleep', q: 'Which habit best supports good sleep hygiene?', options: ['Irregular bedtimes', 'Consistent sleep/wake times', 'Bright screens before bed'], correct: 1, explain: "Keeping a steady schedule helps regulate your body's internal clock." },
  { id: 'q10', category: 'Sleep', q: 'Which is a relaxation technique that can help before bed?', options: ['Slow deep breathing', 'Intense exercise', 'Caffeinated coffee'], correct: 0, explain: 'Slow breathing and gentle stretching help signal your body it is time to rest.' },
  { id: 'q11', category: 'Nutrition', q: 'Why include protein at breakfast?', options: ['It has no benefit', 'It helps steady energy and fullness', 'It replaces the need for water'], correct: 1, explain: 'Protein at breakfast can help keep energy and focus more stable through the morning.' },
  { id: 'q12', category: 'Nutrition', q: "On a 'healthy plate', what portion is typically wholegrains/carbs?", options: ['About a quarter', 'About three-quarters', 'None'], correct: 0, explain: 'A common guide is roughly a quarter wholegrains, a quarter protein, and half vegetables/fruit.' },
]

function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function todayKey() { return new Date().toDateString() }
function readLS(k, fb) { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fb } catch { return fb } }

const WELLNESS_UPDATE_EVENT = 'ri-wellness-updated'
// Lets "Your Week at a Glance" react immediately to a log saved in any tracker above it.
function notifyWellnessUpdate() {
  try { window.dispatchEvent(new Event(WELLNESS_UPDATE_EVENT)) } catch { /* ignore */ }
}

function estimateBurn(minutes, label) {
  const preset = MOVEMENT_PRESETS.find(item => item.label === label)
  const base = preset ? preset.burn / preset.mins : 5
  return Math.round(minutes * base)
}

const SELECT_ARROW = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="#fda4af" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')

const SELECT_STYLE = {
  width: '100%',
  padding: '10px 36px 10px 14px',
  borderRadius: 10,
  border: '1.5px solid rgba(255,215,150,0.18)',
  background: `rgba(20,18,30,0.92) url("${SELECT_ARROW}") no-repeat right 14px center`,
  backgroundSize: '11px',
  color: 'rgba(255,240,200,0.88)',
  fontSize: '0.85rem',
  fontFamily: "'Jost', sans-serif",
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  cursor: 'pointer',
}

const SELECT_OPTION_STYLE = { color: 'rgba(255,240,200,0.92)', background: '#1c1a2b' }

function MovementTracker() {
  const { isAuthenticated } = useAuth()
  const key = `ri_movement_${todayKey()}`
  const [state, setState] = useState(() => {
    const stored = readLS(key, null)
    if (Array.isArray(stored)) return { preset: stored, custom: [] }
    return stored || { preset: [], custom: [] }
  })
  const [customLabel, setCustomLabel] = useState('')
  const [customMinutes, setCustomMinutes] = useState(20)
  const [customIntensity, setCustomIntensity] = useState('moderate')

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    // Every write for today stores the full combined { preset, custom } state,
    // so the freshest (first, since rows are ordered by updated_at desc)
    // matching row for today is the complete remote state.
    fetchEntries({ category: 'wellness', source: 'movement-tracker', limit: 30 }).then(rows => {
      if (!active) return
      const todaysRow = rows.find(r => r.entry_date === todayKey())
      if (todaysRow?.payload) {
        setState(todaysRow.payload)
        try { localStorage.setItem(key, JSON.stringify(todaysRow.payload)) } catch { /* ignore */ }
      }
    })
    return () => { active = false }
  }, [isAuthenticated, key])

  function persist(next) {
    setState(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
    notifyWellnessUpdate()
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
  const { isAuthenticated } = useAuth()
  const [selected, setSelected] = useState(null)
  const [mealText, setMealText] = useState('')
  const [mealMoment, setMealMoment] = useState('breakfast')
  const [reflection, setReflection] = useState('')
  const [mealLogs, setMealLogs] = useState(() => readLS(`ri_meals_${todayKey()}`, []))
  const tip = selected !== null ? MEAL_MOOD_TIPS[selected] : null

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    fetchEntries({ category: 'wellness', source: 'nourishment-guide', limit: 30 }).then(rows => {
      if (!active) return
      const todaysMeals = rows
        .filter(r => r.entry_date === todayKey())
        .map(r => ({
          id: r.payload?.id || r.id,
          ts: r.payload?.ts || new Date(r.updated_at).getTime(),
          text: r.payload?.text,
          moment: r.payload?.moment,
          mood: r.payload?.mood,
          reflection: r.payload?.reflection,
        }))
        .filter(entry => entry.text)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 6)

      if (todaysMeals.length > 0) {
        setMealLogs(todaysMeals)
        try { localStorage.setItem(`ri_meals_${todayKey()}`, JSON.stringify(todaysMeals)) } catch { /* ignore */ }
      }
    })
    return () => { active = false }
  }, [isAuthenticated])

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
    notifyWellnessUpdate()
    syncEntry({
      category: 'wellness',
      source: 'nourishment-guide',
      entryKey: `${todayKey()}-${entry.id}`,
      payload: { id: entry.id, ts: entry.ts, text: entry.text, moment: entry.moment, mood: entry.mood, reflection: entry.reflection },
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
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState('morning')
  const [selected, setSelected] = useState(() => readLS('ri_routine_morning', []))

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    fetchEntries({ category: 'wellness', source: 'routine-builder', limit: 30 }).then(rows => {
      if (!active) return
      const latest = rows.find(r => r.entry_key === tab)
      if (latest?.payload?.items) {
        setSelected(latest.payload.items)
        try { localStorage.setItem(`ri_routine_${tab}`, JSON.stringify(latest.payload.items)) } catch { /* ignore */ }
      }
    })
    return () => { active = false }
  }, [isAuthenticated, tab])

  function toggleItem(id) {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    setSelected(next)
    try { localStorage.setItem(`ri_routine_${tab}`, JSON.stringify(next)) } catch {}
    notifyWellnessUpdate()
    syncEntry({
      category: 'wellness',
      source: 'routine-builder',
      entryKey: tab,
      entryDate: todayKey(),
      payload: { tab, items: next },
    })
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
  const { isAuthenticated } = useAuth()
  const key = `ri_sleep_${todayKey()}`
  const [entry, setEntry] = useState(() => readLS(key, null))
  const [hours, setHours] = useState(entry?.hours ?? 7)
  const [quality, setQuality] = useState(entry?.quality ?? null)
  const [saved, setSaved] = useState(!!entry)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    fetchEntries({ category: 'wellness', source: 'sleep-tracker', limit: 14 }).then(rows => {
      if (!active) return
      const todaysRow = rows.find(r => r.entry_date === todayKey())
      if (todaysRow?.payload) {
        setEntry(todaysRow.payload)
        setHours(todaysRow.payload.hours ?? 7)
        setQuality(todaysRow.payload.quality ?? null)
        setSaved(true)
        try { localStorage.setItem(key, JSON.stringify(todaysRow.payload)) } catch { /* ignore */ }
      }
    })
    return () => { active = false }
  }, [isAuthenticated, key])

  function save() {
    if (!quality) return
    const e = { hours, quality }
    setEntry(e)
    setSaved(true)
    try { localStorage.setItem(key, JSON.stringify(e)) } catch {}
    notifyWellnessUpdate()
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

function HydrationTracker() {
  const { isAuthenticated } = useAuth()
  const key = `ri_hydration_${todayKey()}`
  const [cups, setCups] = useState(() => readLS(key, { cups: 0 }).cups || 0)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    fetchEntries({ category: 'wellness', source: 'hydration-tracker', limit: 14 }).then(rows => {
      if (!active) return
      const todaysRow = rows.find(r => r.entry_date === todayKey())
      if (todaysRow?.payload?.cups != null) {
        setCups(todaysRow.payload.cups)
        try { localStorage.setItem(key, JSON.stringify(todaysRow.payload)) } catch { /* ignore */ }
      }
    })
    return () => { active = false }
  }, [isAuthenticated, key])

  function setCupCount(next) {
    const value = Math.max(0, Math.min(16, next))
    setCups(value)
    try { localStorage.setItem(key, JSON.stringify({ cups: value })) } catch {}
    notifyWellnessUpdate()
    syncEntry({
      category: 'wellness',
      source: 'hydration-tracker',
      entryKey: todayKey(),
      payload: { cups: value },
    })
  }

  const pct = Math.min(100, Math.round((cups / HYDRATION_TARGET) * 100))
  const status = hydrationStatus(cups)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,240,200,0.5)' }}>Tap a glass to log how many cups of water or other fluids you've had today. Target: {HYDRATION_TARGET} cups.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: HYDRATION_TARGET }, (_, i) => {
          const filled = i < cups
          return (
            <button key={i} onClick={() => setCupCount(filled && cups === i + 1 ? i : i + 1)} style={{
              width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: filled ? `1.5px solid ${status.border}` : '1.5px solid rgba(255,215,150,0.15)',
              background: filled ? status.bg : 'rgba(255,245,220,0.04)',
              cursor: 'pointer', fontSize: 18, transition: 'all 0.18s',
            }}>
              {filled ? '\u{1F4A7}' : '\u{1F95B}'}
            </button>
          )
        })}
        <button onClick={() => setCupCount(cups + 1)} style={{
          padding: '0 14px', height: 38, borderRadius: 10, border: '1.5px dashed rgba(255,215,150,0.25)',
          background: 'rgba(255,245,220,0.04)', color: 'rgba(255,240,200,0.65)', cursor: 'pointer', fontSize: '0.8rem',
        }}>
          +1 extra
        </button>
      </div>
      <div style={{ background: status.bg, border: `1px solid ${status.border}`, borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: status.color, textAlign: 'center' }}>
        {status.emoji} {status.label} -- {cups} of {HYDRATION_TARGET} cups logged today ({pct}%).
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {HYDRATION_TIPS.map(tip => (
          <div key={tip.title} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: '0.78rem', color: '#7dd3fc', fontWeight: 600, marginBottom: 4 }}>{tip.title}</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,240,200,0.6)', lineHeight: 1.5 }}>{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const FACT_CATEGORIES = ['All', 'Nutrition', 'Hydration', 'Exercise', 'Sleep']

function WellnessKnowledgeHub() {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState('learn')
  const [factCategory, setFactCategory] = useState('All')
  const [factIndex, setFactIndex] = useState(0)
  const [factFlipped, setFactFlipped] = useState(false)
  const [quizSet, setQuizSet] = useState(() => shuffleArray(QUIZ_QUESTIONS).slice(0, 6))
  const [qIndex, setQIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [stats, setStats] = useState(() => readLS('ri_wellness_quiz_stats', { attempts: 0, bestScore: 0 }))

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    fetchEntries({ category: 'wellness', source: 'wellness-quiz', limit: 5 }).then(rows => {
      if (!active) return
      const latest = rows[0]?.payload
      if (latest) {
        setStats(latest)
        try { localStorage.setItem('ri_wellness_quiz_stats', JSON.stringify(latest)) } catch { /* ignore */ }
      }
    })
    return () => { active = false }
  }, [isAuthenticated])

  const filteredFacts = factCategory === 'All' ? FACT_CARDS : FACT_CARDS.filter(c => c.category === factCategory)
  const currentFact = filteredFacts[Math.min(factIndex, filteredFacts.length - 1)]

  function changeCategory(cat) {
    setFactCategory(cat)
    setFactIndex(0)
    setFactFlipped(false)
  }

  function goToFact(delta) {
    setFactFlipped(false)
    setFactIndex(i => {
      const next = i + delta
      if (next < 0) return filteredFacts.length - 1
      if (next >= filteredFacts.length) return 0
      return next
    })
  }

  function chooseOption(idx) {
    if (selectedOption !== null) return
    setSelectedOption(idx)
    if (idx === quizSet[qIndex].correct) setScore(s => s + 1)
  }

  function nextQuestion() {
    if (qIndex + 1 < quizSet.length) {
      setQIndex(i => i + 1)
      setSelectedOption(null)
      return
    }
    const finalScore = score + (selectedOption === quizSet[qIndex].correct ? 0 : 0)
    const next = { attempts: stats.attempts + 1, bestScore: Math.max(stats.bestScore, finalScore) }
    setStats(next)
    setFinished(true)
    try { localStorage.setItem('ri_wellness_quiz_stats', JSON.stringify(next)) } catch {}
    syncEntry({
      category: 'wellness',
      source: 'wellness-quiz',
      entryKey: `${todayKey()}-${Date.now()}`,
      payload: next,
    })
  }

  function retakeQuiz() {
    setQuizSet(shuffleArray(QUIZ_QUESTIONS).slice(0, 6))
    setQIndex(0)
    setSelectedOption(null)
    setScore(0)
    setFinished(false)
  }

  const current = quizSet[qIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {[{ id: 'learn', label: 'Did You Know' }, { id: 'quiz', label: 'Quick Quiz' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 20px', borderRadius: 999, cursor: 'pointer', fontSize: '0.85rem',
            border: tab === t.id ? '1.5px solid #38bdf8' : '1.5px solid rgba(255,215,150,0.15)',
            background: tab === t.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,245,220,0.04)',
            color: tab === t.id ? '#7dd3fc' : 'rgba(255,240,200,0.55)', transition: 'all 0.18s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'learn' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FACT_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => changeCategory(cat)} style={{
                padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontSize: '0.72rem',
                border: factCategory === cat ? '1.5px solid #38bdf8' : '1.5px solid rgba(255,215,150,0.15)',
                background: factCategory === cat ? 'rgba(56,189,248,0.15)' : 'rgba(255,245,220,0.04)',
                color: factCategory === cat ? '#7dd3fc' : 'rgba(255,240,200,0.55)',
              }}>
                {cat}
              </button>
            ))}
          </div>

          {currentFact && (
            <div style={{ perspective: 1200 }}>
              <div
                onClick={() => setFactFlipped(f => !f)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setFactFlipped(f => !f) }}
                style={{
                  position: 'relative', minHeight: 180, cursor: 'pointer',
                  transformStyle: 'preserve-3d', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                  transform: factFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                  textAlign: 'center', padding: '28px 20px', borderRadius: 16,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                  border: '1.5px solid rgba(255,215,150,0.15)', background: 'rgba(255,245,220,0.04)', color: 'white',
                }}>
                  <span style={{ fontSize: 30 }}>{currentFact.emoji}</span>
                  <span style={{ fontSize: '0.72rem', color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{currentFact.category}</span>
                  <span style={{ fontSize: '1rem', color: 'rgba(255,240,200,0.9)', lineHeight: 1.5, maxWidth: 380 }}>{currentFact.front}</span>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,240,200,0.35)' }}>Tap the card to reveal the answer</span>
                </div>
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                  textAlign: 'center', padding: '28px 20px', borderRadius: 16,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                  border: '1.5px solid rgba(56,189,248,0.5)', background: 'rgba(56,189,248,0.1)', color: 'white',
                }}>
                  <span style={{ fontSize: 30 }}>{currentFact.emoji}</span>
                  <span style={{ fontSize: '0.72rem', color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{currentFact.category}</span>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,240,200,0.8)', lineHeight: 1.6, maxWidth: 380 }}>{currentFact.back}</span>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,240,200,0.35)' }}>Tap to see the question again</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <button onClick={() => goToFact(-1)} style={{ padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(255,215,150,0.2)', background: 'rgba(255,245,220,0.04)', color: 'rgba(255,240,200,0.7)', cursor: 'pointer' }}>{'←'} Prev</button>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,240,200,0.45)' }}>{filteredFacts.length ? factIndex + 1 : 0} / {filteredFacts.length}</span>
            <button onClick={() => goToFact(1)} style={{ padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(255,215,150,0.2)', background: 'rgba(255,245,220,0.04)', color: 'rgba(255,240,200,0.7)', cursor: 'pointer' }}>Next {'→'}</button>
          </div>
        </div>
      )}

      {tab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,240,200,0.45)' }}>
            Best score: {stats.bestScore}/6 · Attempts: {stats.attempts}
          </p>
          {!finished ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '0.72rem', color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Question {qIndex + 1} of {quizSet.length} · {current.category}
              </p>
              <p style={{ fontSize: '0.95rem', color: 'white', lineHeight: 1.5 }}>{current.q}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {current.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx
                  const isCorrect = idx === current.correct
                  let border = '1.5px solid rgba(255,215,150,0.15)'
                  let bg = 'rgba(255,245,220,0.04)'
                  let color = 'rgba(255,240,200,0.8)'
                  if (selectedOption !== null && isCorrect) { border = '1.5px solid rgba(74,222,128,0.6)'; bg = 'rgba(74,222,128,0.12)'; color = '#86efac' }
                  else if (isSelected && !isCorrect) { border = '1.5px solid rgba(239,68,68,0.6)'; bg = 'rgba(239,68,68,0.12)'; color = '#fca5a5' }
                  return (
                    <button key={idx} onClick={() => chooseOption(idx)} disabled={selectedOption !== null} style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: 10, border, background: bg, color,
                      cursor: selectedOption === null ? 'pointer' : 'default', fontSize: '0.85rem', transition: 'all 0.18s',
                    }}>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {selectedOption !== null && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,240,200,0.6)', lineHeight: 1.5 }}>{current.explain}</p>
                  <button onClick={nextQuestion} style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {qIndex + 1 < quizSet.length ? 'Next Question' : 'See Results'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRadius: 14, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)', textAlign: 'center' }}>
              <p style={{ fontSize: '1.4rem', color: 'white' }}>You scored {score}/{quizSet.length}</p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,240,200,0.6)' }}>
                {score === quizSet.length ? 'Perfect score! Your wellness knowledge is sharp.' : 'Keep exploring the Did You Know cards to boost your score next time.'}
              </p>
              <button onClick={retakeQuiz} style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const DAILY_TRACKER_TABS = [
  { id: 'movement', label: 'Movement', emoji: '\u{1F3C3}', hint: "Tick off what you've done today or add a custom activity if it is not on the list." },
  { id: 'nourishment', label: 'Nourishment', emoji: '\u{1F957}', hint: 'A mood-food awareness log, not a calorie counter -- select a mood for food ideas, then jot what you ate and how it felt.' },
  { id: 'hydration', label: 'Hydration', emoji: '\u{1F4A7}', hint: 'Log your cups of water today and learn to spot the early signs of running low.' },
  { id: 'routine', label: 'Routine', emoji: '\u{1F4C5}', hint: 'Build a personalised morning or evening routine of small, consistent rituals.' },
  { id: 'sleep', label: 'Sleep', emoji: '\u{1F4A4}', hint: 'Log your sleep to build awareness of how rest shapes your mood and energy.' },
]

function DailyTrackers() {
  const [tab, setTab] = useState('movement')
  const active = DAILY_TRACKER_TABS.find(t => t.id === tab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {DAILY_TRACKER_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontSize: '0.82rem',
            border: tab === t.id ? '1.5px solid #f43f5e' : '1.5px solid rgba(255,215,150,0.15)',
            background: tab === t.id ? 'rgba(244,63,94,0.15)' : 'rgba(255,245,220,0.04)',
            color: tab === t.id ? '#fda4af' : 'rgba(255,240,200,0.55)', transition: 'all 0.18s',
          }}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,240,200,0.5)' }}>
        {active.hint} These check-ins feed straight into "Your Week at a Glance" below.
      </p>
      {tab === 'movement' && <MovementTracker />}
      {tab === 'nourishment' && <NourishmentGuide />}
      {tab === 'hydration' && <HydrationTracker />}
      {tab === 'routine' && <RoutineBuilder />}
      {tab === 'sleep' && <SleepTracker />}
    </div>
  )
}

function WeeklySummary() {
  // Re-render whenever any tracker above saves, so this stays live without leaving the page.
  const [, forceRefresh] = useState(0)
  useEffect(() => {
    const handler = () => forceRefresh(n => n + 1)
    window.addEventListener(WELLNESS_UPDATE_EVENT, handler)
    return () => window.removeEventListener(WELLNESS_UPDATE_EVENT, handler)
  }, [])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toDateString()
    const movement = readLS(`ri_movement_${dateStr}`, null)
    const sleep = readLS(`ri_sleep_${dateStr}`, null)
    const meals = readLS(`ri_meals_${dateStr}`, [])
    const hydration = readLS(`ri_hydration_${dateStr}`, null)
    return { dateStr, day: d.toLocaleDateString('en', { weekday: 'short' }), movement, sleep, meals, hydration }
  })

  let totalMinutes = 0
  let totalBurn = 0
  let sleepHoursSum = 0
  let sleepCount = 0
  let nourishmentCount = 0
  let hydrationSum = 0
  let hydrationCount = 0

  days.forEach(({ movement, sleep, meals, hydration }) => {
    if (movement) {
      const presetMinutes = (movement.preset || []).reduce((sum, id) => sum + (MOVEMENT_PRESETS.find(m => m.id === id)?.mins || 0), 0)
      const customMinutes = (movement.custom || []).reduce((sum, e) => sum + e.minutes, 0)
      totalMinutes += presetMinutes + customMinutes
      totalBurn += (movement.preset || []).reduce((sum, id) => {
        const item = MOVEMENT_PRESETS.find(m => m.id === id)
        return sum + (item ? item.burn : 0)
      }, 0) + (movement.custom || []).reduce((sum, e) => sum + estimateBurn(e.minutes, e.label), 0)
    }
    if (sleep?.hours != null) {
      sleepHoursSum += sleep.hours
      sleepCount += 1
    }
    if (hydration?.cups != null) {
      hydrationSum += hydration.cups
      hydrationCount += 1
    }
    nourishmentCount += meals.length
  })

  const avgSleep = sleepCount ? (sleepHoursSum / sleepCount).toFixed(1) : null
  const avgHydration = hydrationCount ? (hydrationSum / hydrationCount).toFixed(1) : null
  const activeDays = days.filter(d => d.movement || d.sleep || d.meals.length > 0 || d.hydration).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,240,200,0.45)', marginBottom: 6 }}>Movement this week</p>
          <p style={{ color: 'white', fontSize: '1.1rem' }}>{totalMinutes} min{totalBurn > 0 ? ` · ~${totalBurn} cal` : ''}</p>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,240,200,0.45)', marginBottom: 6 }}>Average sleep</p>
          <p style={{ color: 'white', fontSize: '1.1rem' }}>{avgSleep ? `${avgSleep}h` : 'No logs yet'}</p>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,240,200,0.45)', marginBottom: 6 }}>Nourishment check-ins</p>
          <p style={{ color: 'white', fontSize: '1.1rem' }}>{nourishmentCount}</p>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,240,200,0.45)', marginBottom: 6 }}>Average hydration</p>
          <p style={{ color: 'white', fontSize: '1.1rem' }}>{avgHydration ? `${avgHydration} cups` : 'No logs yet'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
        {days.map(d => {
          const logged = d.movement || d.sleep || d.meals.length > 0 || d.hydration
          return (
            <div key={d.dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: logged ? 'rgba(244,63,94,0.16)' : 'rgba(255,255,255,0.04)',
                border: logged ? '2px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                fontSize: 14,
              }}>
                {logged ? '✓' : '·'}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,240,200,0.45)' }}>{d.day}</span>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'rgba(255,240,200,0.45)', textAlign: 'center' }}>
        {activeDays > 0
          ? `You logged something in Wellness Villa on ${activeDays} of the last 7 days.`
          : 'Log movement, sleep, or a meal above to start building your weekly picture.'}
      </p>
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
          icon: '\u{1F49A}',
          title: 'Daily Trackers',
          text: 'Movement, nourishment, hydration, routine, and sleep, all in one place. Switch tabs to log each one -- your entries build the weekly picture below rather than counting calories or macros.',
          component: <DailyTrackers />
        },
        {
          icon: '\u{1F9E0}',
          title: 'Wellness Knowledge Hub',
          text: 'Flip through bite-sized facts about nutrition, hydration, exercise, and sleep, then test what you know with a quick quiz.',
          component: <WellnessKnowledgeHub />
        },
        {
          icon: '\u{1F4C5}',
          title: 'Your Week at a Glance',
          text: 'The insight from everything you have logged: movement, sleep, nourishment, and hydration trends over the last 7 days.',
          component: <WeeklySummary />
        }
      ]
    }} />
  )
}

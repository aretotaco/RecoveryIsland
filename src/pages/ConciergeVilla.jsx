import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MaiaGuide from '../components/MaiaGuide'
import { MaiaAvatarSvg, MaiaAvatarBuilder, loadMaiaAvatar, saveMaiaAvatar } from '../components/MaiaAvatar'
import { useAuth } from '../context/AuthContext'
import { syncEntry, syncProfile } from '../lib/villaSync'

const VILLAS = [
  { path: '/mood-diary',  label: 'Mood Diary Centre', emoji: '\u{1F4D3}', recommended: true,  note: 'Start here - log your first mood check-in' },
  { path: '/mindfulness', label: 'Mindfulness Villa',  emoji: '\u{1F9D8}', recommended: false, note: 'Breathe and ground yourself' },
  { path: '/relaxation',  label: 'Relaxation Villa',   emoji: '\u{1F33F}', recommended: false, note: 'Unwind with calming activities' },
  { path: '/wellness',    label: 'Wellness Villa',     emoji: '\u{1F49A}', recommended: false, note: 'Build healthy daily habits' },
  { path: '/inspiration', label: 'Inspiration Villa',  emoji: '✨',    recommended: false, note: 'Real stories, affirmations, and goals' },
  { path: '/ai-chatbot',  label: 'AI Companion',       emoji: '\u{1F916}', recommended: false, note: 'Talk things through anytime' },
]

const CONCIERGE_KEY = 'ri_concierge_v2'
function loadConcierge() { try { return JSON.parse(localStorage.getItem(CONCIERGE_KEY) || 'null') } catch { return null } }
function saveConcierge(s) { try { localStorage.setItem(CONCIERGE_KEY, JSON.stringify(s)) } catch {} }

export default function ConciergeVilla() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const saved = loadConcierge()
  const [phase,     setPhase]     = useState(saved ? 'main' : 'welcome')
  const [wizStep,   setWizStep]   = useState(0)
  const [avatarCfg, setAvatarCfg] = useState(() => saved?.avatarConfig || user?.avatarConfig || loadMaiaAvatar())
  const [visited,   setVisited]   = useState(saved?.visited || [])
  const [editing,   setEditing]   = useState(false)

  useEffect(() => {
    if (phase === 'main') saveConcierge({ visited, avatarConfig: avatarCfg })
  }, [avatarCfg, phase, visited])

  function finishWizard() {
    saveMaiaAvatar(avatarCfg)
    setPhase('main')
    setEditing(false)
    saveConcierge({ visited, avatarConfig: avatarCfg })
    syncProfile({ avatarConfig: avatarCfg })
    syncEntry({
      category: 'concierge',
      source: 'concierge-villa',
      entryKey: 'profile',
      payload: { visited, avatarConfig: avatarCfg },
    })
  }

  function markVisited(path) {
    if (!visited.includes(path)) {
      const next = [...visited, path]
      setVisited(next)
      saveConcierge({ visited: next, avatarConfig: avatarCfg })
      syncEntry({
        category: 'concierge',
        source: 'island-map',
        entryKey: 'visited',
        payload: { visited: next, path },
      })
    }
    navigate(path)
  }

  const allVisited  = VILLAS.every(v => visited.includes(v.path))
  const moodVisited = visited.includes('/mood-diary')
  const vs = { '--villa-color': '#f59e0b', '--villa-color-light': '#fcd34d' }

  if (phase === 'welcome' || editing) {
    return (
      <div className="villa-page" style={vs}>
        <div className="villa-bg">
          <div className="villa-bg-orb orb1" />
          <div className="villa-bg-orb orb2" />
          <div className="villa-bg-orb orb3" />
        </div>
        {editing && <button className="back-btn" onClick={() => setEditing(false)}>Back</button>}
        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 40px' }}>

          {wizStep === 0 && (
            <div className="villa-card" style={{ maxWidth: 520, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>🏝</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: 'var(--ri-text-primary)', letterSpacing: 3, marginBottom: 12 }}>
                Welcome to Recovery Island
              </h1>
              <p style={{ color: 'var(--ri-text-secondary)', lineHeight: 1.8, marginBottom: 10 }}>
                A gentle, judgement-free space for anyone facing challenges — stress, anxiety, low mood, or simply needing a reset.
              </p>
              <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 28 }}>
                Before you explore, create your personal companion — Maia. She will guide you through the island.
              </p>
              <button className="card-btn" style={{ padding: '12px 32px', fontSize: '1rem' }} onClick={() => setWizStep(1)}>
                Meet Maia
              </button>
            </div>
          )}

          {wizStep === 1 && (
            <div className="villa-card" style={{ maxWidth: 560, width: '100%' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, color: 'var(--ri-text-primary)', textAlign: 'center', marginBottom: 6 }}>
                Customise Maia
              </h2>
              <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: 18 }}>
                Make her your own — she will appear throughout the island.
              </p>
              <MaiaAvatarBuilder config={avatarCfg} onChange={cfg => { setAvatarCfg(cfg); saveMaiaAvatar(cfg) }} />
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
                <button className="card-btn" style={{ background: 'var(--ri-input-border)', fontSize: '0.9rem' }} onClick={() => setWizStep(0)}>Back</button>
                <button className="card-btn" style={{ fontSize: '0.9rem', padding: '11px 28px' }} onClick={finishWizard}>
                  Enter the Island
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="villa-page" style={vs}>
      <div className="villa-bg">
        <div className="villa-bg-orb orb1" />
        <div className="villa-bg-orb orb2" />
        <div className="villa-bg-orb orb3" />
      </div>
      <button className="back-btn" onClick={() => navigate('/')}>Back to Island</button>

      <div className="villa-hero">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <MaiaAvatarSvg config={avatarCfg} width={110} height={138} />
        </div>
        <div className="villa-tag">Concierge Villa</div>
        <h1 className="villa-title">Welcome back</h1>
        <p className="villa-subtitle">Your guide to Recovery Island. Explore at your own pace.</p>
        <button
          onClick={() => { setWizStep(1); setEditing(true) }}
          style={{ marginTop: 10, background: 'var(--ri-card-border)', border: '1px solid var(--ri-card-bg-hover)', color: 'var(--ri-text-secondary)', borderRadius: 999, padding: '6px 18px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Customise Maia
        </button>
      </div>

      <div className="villa-content">

        <div className="villa-card" style={{ animationDelay: '0s' }}>
          <div className="card-icon">🗺</div>
          <h3 className="card-title">How Recovery Island works</h3>
          <p className="card-text">Six destinations, each supporting a different part of your wellbeing journey.</p>
          <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 14, padding: '14px 18px', marginTop: 12, color: 'var(--ri-text-primary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
            Visit the <strong>Mood Diary Centre first</strong> to log your baseline. Explore the villas. When done, <strong>return to compare</strong> how you feel.
          </div>
        </div>

        <div className="villa-card" style={{ animationDelay: '0.1s' }}>
          <div className="card-icon">🧭</div>
          <h3 className="card-title">Your island journey</h3>
          <p className="card-text" style={{ marginBottom: 16 }}>
            {allVisited
              ? 'You have visited every destination! Head back to the Mood Diary Centre to see how things have shifted.'
              : 'Tap a villa to visit. We recommend starting with the Mood Diary Centre.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {VILLAS.map(v => {
              const done = visited.includes(v.path)
              return (
                <button key={v.path} onClick={() => markVisited(v.path)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 14,
                  border: done ? '1.5px solid rgba(74,222,128,0.45)' : v.recommended ? '1.5px solid rgba(245,158,11,0.5)' : '1.5px solid var(--ri-card-border)',
                  background: done ? 'rgba(74,222,128,0.07)' : v.recommended ? 'rgba(245,158,11,0.08)' : 'var(--ri-card-bg)',
                  cursor: 'pointer', textAlign: 'left', color: 'var(--ri-text-primary)', transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{done ? '✅' : v.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {v.label}
                      {v.recommended && !done && <span style={{ fontSize: '0.68rem', background: '#f59e0b', color: '#1a1a2e', borderRadius: 6, padding: '2px 7px', fontWeight: 700 }}>START HERE</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ri-text-muted)', marginTop: 2 }}>{v.note}</div>
                  </div>
                  <span style={{ color: 'var(--ri-text-muted)', fontSize: '1rem' }}>→</span>
                </button>
              )
            })}
          </div>
          {allVisited && (
            <button className="card-btn" style={{ marginTop: 16, width: '100%', padding: '13px', fontSize: '0.95rem' }} onClick={() => markVisited('/mood-diary')}>
              Return to Mood Diary to compare
            </button>
          )}
        </div>

        <div className="villa-card" style={{ animationDelay: '0.2s' }}>
          <div className="card-icon">💬</div>
          <h3 className="card-title">You belong here</h3>
          <p className="card-text">Recovery Island is for anyone going through a difficult time — adjusting to a new chapter, dealing with stress or anxiety, feeling low, or simply needing a moment of calm.</p>
          <p className="card-text" style={{ marginTop: 10 }}>You do not need a diagnosis to be here. You just need to be a person who wants things to feel a little better.</p>
        </div>

        <div className="villa-card" style={{ animationDelay: '0.3s' }}>
          <div className="card-icon">📊</div>
          <h3 className="card-title">Your progress</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
            <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'var(--ri-card-border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(visited.length / VILLAS.length) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #fcd34d)', borderRadius: 999, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ color: 'var(--ri-text-secondary)', fontSize: '0.85rem', flexShrink: 0 }}>{visited.length} / {VILLAS.length}</span>
          </div>
          {!moodVisited && <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.82rem', marginTop: 10 }}>Visit Mood Diary Centre first to set your baseline mood.</p>}
          {moodVisited && !allVisited && <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.82rem', marginTop: 10 }}>Great start. Explore the remaining villas, then return to compare.</p>}
          {allVisited && <p style={{ color: '#4ade80', fontSize: '0.82rem', marginTop: 10 }}>You have completed the full island journey.</p>}
        </div>
      </div>

      <MaiaGuide villaId={1} />
    </div>
  )
}

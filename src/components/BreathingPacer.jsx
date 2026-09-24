import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../lib/activityTracking'

// pattern -> villa is a closed set (box breathing lives on Mindfulness,
// 4-7-8 on Relaxation), so this stays self-contained instead of needing a
// villa prop threaded through from every page that renders the pacer.
const PATTERN_VILLA = { box: 'mindfulness', 478: 'relaxation' }

const PATTERNS = {
  box: {
    name: 'Box Breathing',
    desc: 'Equal counts of inhale, hold, exhale, hold — a steady square of breath used to calm the nervous system fast.',
    color: '#10b981',
    steps: [
      { label: 'Inhale', seconds: 4, scale: 1.4 },
      { label: 'Hold', seconds: 4, scale: 1.4 },
      { label: 'Exhale', seconds: 4, scale: 1 },
      { label: 'Hold', seconds: 4, scale: 1 },
    ],
  },
  478: {
    name: '4-7-8 Breathing',
    desc: 'A longer exhale than inhale signals safety to your body. Popularised by Dr. Andrew Weil for quick, deep relaxation.',
    color: '#06b6d4',
    steps: [
      { label: 'Inhale', seconds: 4, scale: 1.4 },
      { label: 'Hold', seconds: 7, scale: 1.4 },
      { label: 'Exhale', seconds: 8, scale: 1 },
    ],
  },
}

export default function BreathingPacer({ pattern = 'box' }) {
  const config = PATTERNS[pattern] || PATTERNS.box
  const [running, setRunning] = useState(false)
  const [state, setState] = useState({ stepIndex: 0, secondsLeft: config.steps[0].seconds, cycles: 0 })
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return undefined

    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.secondsLeft > 1) {
          return { ...prev, secondsLeft: prev.secondsLeft - 1 }
        }
        const nextIndex = (prev.stepIndex + 1) % config.steps.length
        return {
          stepIndex: nextIndex,
          secondsLeft: config.steps[nextIndex].seconds,
          cycles: nextIndex === 0 ? prev.cycles + 1 : prev.cycles,
        }
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [running, config])

  const step = config.steps[state.stepIndex]

  function reset() {
    setRunning(false)
    setState({ stepIndex: 0, secondsLeft: config.steps[0].seconds, cycles: 0 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 220, height: 220 }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${config.color}55, ${config.color}22)`,
            border: `2px solid ${config.color}88`,
            boxShadow: `0 0 40px ${config.color}40`,
            transform: `scale(${step.scale})`,
            transition: `transform ${step.seconds}s ease-in-out`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600, transform: `scale(${1 / step.scale})`, transition: `transform ${step.seconds}s ease-in-out` }}>
            {running ? state.secondsLeft : ''}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: config.color, fontSize: '1.1rem', fontWeight: 600, letterSpacing: 1 }}>
          {running ? step.label : 'Ready when you are'}
        </p>
        <p style={{ color: 'var(--ri-text-warm-muted)', fontSize: '0.78rem', marginTop: 4 }}>
          {config.name} · {state.cycles} {state.cycles === 1 ? 'cycle' : 'cycles'} completed
        </p>
      </div>

      <p style={{ color: 'var(--ri-text-warm-muted)', fontSize: '0.8rem', lineHeight: 1.6, textAlign: 'center', maxWidth: 340 }}>
        {config.desc}
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => setRunning(r => {
            if (!r) trackEvent('feature_click', { villa: PATTERN_VILLA[pattern], feature: 'breathing-pacer' })
            return !r
          })}
          style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: config.color, color: 'white', fontWeight: 600, cursor: 'pointer' }}
        >
          {running ? 'Pause' : state.cycles > 0 || state.stepIndex > 0 ? 'Resume' : 'Start'}
        </button>
        <button
          onClick={reset}
          style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid var(--ri-input-border)', background: 'var(--ri-card-bg)', color: 'var(--ri-text-warm-secondary)', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

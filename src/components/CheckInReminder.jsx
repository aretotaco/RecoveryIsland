import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function todayStr() {
  return new Date().toDateString()
}

function readMoods() {
  try { return JSON.parse(localStorage.getItem('ri_moods') || '[]') } catch { return [] }
}

function hasTodayEntry() {
  return readMoods().some(e => new Date(e.ts).toDateString() === todayStr())
}

function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export default function CheckInReminder() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [permission, setPermission] = useState(notificationsSupported() ? Notification.permission : 'unsupported')

  useEffect(() => {
    function check() {
      const dismissedKey = `ri_reminder_dismissed_${todayStr()}`
      const alreadyDismissed = localStorage.getItem(dismissedKey) === 'true'
      const missing = !hasTodayEntry()

      setVisible(missing && !alreadyDismissed)

      if (missing && notificationsSupported() && Notification.permission === 'granted') {
        const notifiedKey = `ri_last_reminder_notified`
        if (localStorage.getItem(notifiedKey) !== todayStr()) {
          try {
            new Notification('Recovery Island', {
              body: "You haven't checked in today. A moment in the Mood Diary Centre goes a long way.",
            })
            localStorage.setItem(notifiedKey, todayStr())
          } catch {}
        }
      }
    }

    check()
    document.addEventListener('visibilitychange', check)
    return () => document.removeEventListener('visibilitychange', check)
  }, [])

  function dismiss() {
    try { localStorage.setItem(`ri_reminder_dismissed_${todayStr()}`, 'true') } catch {}
    setVisible(false)
  }

  async function enableReminders() {
    if (!notificationsSupported()) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 45,
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
      maxWidth: 'min(92vw, 520px)', padding: '12px 18px', borderRadius: 16,
      background: 'var(--ri-nav-pill-bg)', backdropFilter: 'blur(14px)', border: '1px solid var(--ri-card-border)',
      color: 'var(--ri-text-primary)', fontSize: '0.85rem', boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
    }}>
      <span>🌤️ Haven't checked in today yet.</span>
      <button
        onClick={() => navigate('/mood-diary')}
        style={{ padding: '7px 14px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
      >
        Check in
      </button>
      {notificationsSupported() && permission === 'default' && (
        <button
          onClick={enableReminders}
          style={{ padding: '7px 14px', borderRadius: 999, border: '1px solid var(--ri-input-border)', background: 'var(--ri-input-bg)', color: 'var(--ri-text-secondary)', cursor: 'pointer' }}
        >
          Enable reminders
        </button>
      )}
      <button onClick={dismiss} style={{ background: 'none', border: 'none', color: 'var(--ri-text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}

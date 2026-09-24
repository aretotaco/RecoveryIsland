import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [studyId, setStudyId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(studyId, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Unable to continue')
    } finally {
      setLoading(false)
    }
  }

  return (
    // height + overflowY (not minHeight) because body is locked to 100vh
    // globally (see index.css, for the island map's fixed viewport).
    <div style={{ height: '100vh', overflowY: 'auto', display: 'grid', placeItems: 'center', padding: 24, background: 'radial-gradient(circle at top, rgba(245,158,11,0.2), transparent 35%), var(--ri-page-bg-navy)' }}>
      <div style={{ width: '100%', maxWidth: 520, borderRadius: 28, padding: 28, background: 'var(--ri-card-bg-strong)', border: '1px solid var(--ri-card-border)', backdropFilter: 'blur(18px)', color: 'var(--ri-text-primary)', boxShadow: '0 40px 100px rgba(0,0,0,0.35)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🏝️</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.3rem', margin: 0 }}>Recovery Island</h1>
          <p style={{ color: 'var(--ri-text-secondary)', lineHeight: 1.7, marginTop: 8 }}>Sign in with the Study ID and password given to you by the study team.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input value={studyId} onChange={e => setStudyId(e.target.value)} type="text" autoCapitalize="characters" placeholder="Study ID" style={{ padding: '13px 14px', borderRadius: 14, border: '1px solid var(--ri-input-border)', background: 'var(--ri-input-bg)', color: 'var(--ri-text-primary)' }} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" style={{ padding: '13px 14px', borderRadius: 14, border: '1px solid var(--ri-input-border)', background: 'var(--ri-input-bg)', color: 'var(--ri-text-primary)' }} />
          {error && <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{error}</div>}
          <button disabled={loading} type="submit" style={{ padding: '13px 16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#111827', fontWeight: 800, cursor: 'pointer' }}>
            {loading ? 'Please wait...' : 'Sign in'}
          </button>
        </form>

        {isAuthenticated && (
          <p style={{ marginTop: 14, textAlign: 'center', color: '#86efac' }}>You are already signed in.</p>
        )}
      </div>
    </div>
  )
}

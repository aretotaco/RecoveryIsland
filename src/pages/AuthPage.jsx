import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, register, isAuthenticated } = useAuth()
  const [mode, setMode] = useState('login')
  const [studyId, setStudyId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      if (mode === 'login') {
        await login(studyId, password)
        navigate('/')
      } else {
        const result = await register(studyId, password)
        if (result?.needsEmailConfirmation) {
          setNotice('Your account was created, but this Supabase project still has email confirmation turned on for a domain that cannot receive mail. Ask the study administrator to disable "Confirm email" in Supabase, then try signing in again.')
          setMode('login')
          setPassword('')
          return
        }
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Unable to continue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'radial-gradient(circle at top, rgba(245,158,11,0.2), transparent 35%), linear-gradient(180deg, #0f172a, #111827 60%, #09090b)' }}>
      <div style={{ width: '100%', maxWidth: 520, borderRadius: 28, padding: 28, background: 'rgba(17,24,39,0.78)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(18px)', color: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.35)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🏝️</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.3rem', margin: 0 }}>Recovery Island</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginTop: 8 }}>Sign in with your Study ID to save your mood diary, wellness logs, avatar, and villa activity.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button onClick={() => setMode('login')} style={{ flex: 1, padding: '11px 14px', borderRadius: 14, border: mode === 'login' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)', background: mode === 'login' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: 'white', cursor: 'pointer' }}>Sign in</button>
          <button onClick={() => setMode('register')} style={{ flex: 1, padding: '11px 14px', borderRadius: 14, border: mode === 'register' ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.12)', background: mode === 'register' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', color: 'white', cursor: 'pointer' }}>Create account</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input value={studyId} onChange={e => setStudyId(e.target.value)} type="text" autoCapitalize="characters" placeholder="Study ID" style={{ padding: '13px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" style={{ padding: '13px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          {notice && <div style={{ color: '#86efac', fontSize: '0.9rem' }}>{notice}</div>}
          {error && <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{error}</div>}
          <button disabled={loading} type="submit" style={{ padding: '13px 16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#111827', fontWeight: 800, cursor: 'pointer' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {isAuthenticated && (
          <p style={{ marginTop: 14, textAlign: 'center', color: '#86efac' }}>You are already signed in.</p>
        )}
      </div>
    </div>
  )
}

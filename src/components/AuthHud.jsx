import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// Placed here (rather than per-page) because AuthHud already renders
// unconditionally on every route — one integration point covers the whole
// app, including pages that don't use AuthContext at all (e.g. /admin).
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 40, height: 40, display: 'grid', placeItems: 'center', fontSize: 17,
        border: '1px solid var(--ri-card-border)', background: 'var(--ri-nav-pill-bg)',
        borderRadius: 999, backdropFilter: 'blur(14px)', cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

export default function AuthHud() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, loading } = useAuth()

  if (loading) return null

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
      <ThemeToggle />
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 999, background: 'var(--ri-nav-pill-bg)', border: '1px solid var(--ri-card-border)', backdropFilter: 'blur(14px)', color: 'var(--ri-text-primary)' }}>
          <span style={{ fontSize: 12, color: 'var(--ri-text-secondary)' }}>{user?.displayName || 'Traveller'}</span>
          <button onClick={() => navigate('/guide')} title="User Guide" style={{ border: '1px solid var(--ri-input-border)', background: 'var(--ri-card-bg)', color: 'var(--ri-text-primary)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}>
            📖 Guide
          </button>
          <button onClick={() => navigate('/settings')} style={{ border: '1px solid var(--ri-input-border)', background: 'var(--ri-card-bg)', color: 'var(--ri-text-primary)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}>
            Account
          </button>
          <button onClick={logout} style={{ border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#1f2937', borderRadius: 999, padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}>
            Logout
          </button>
        </div>
      ) : (
        <button onClick={() => navigate('/login')} style={{ border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', borderRadius: 999, padding: '10px 16px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(99,102,241,0.25)' }}>
          Sign in
        </button>
      )}
    </div>
  )
}

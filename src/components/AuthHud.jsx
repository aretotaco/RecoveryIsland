import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthHud() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, loading } = useAuth()

  if (loading) return null

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 40 }}>
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 999, background: 'rgba(17,24,39,0.72)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(14px)', color: 'white' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{user?.displayName || 'Traveller'}</span>
          <button onClick={() => navigate('/login')} style={{ border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: 'white', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}>
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

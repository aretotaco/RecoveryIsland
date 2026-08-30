import { useNavigate, useLocation } from 'react-router-dom'

export default function CrisisHud() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/crisis-support') return null

  return (
    <button
      onClick={() => navigate('/crisis-support')}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid rgba(239,68,68,0.4)',
        background: 'rgba(17,24,39,0.72)',
        backdropFilter: 'blur(14px)',
        color: '#fca5a5',
        borderRadius: 999,
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: "'Jost', sans-serif",
      }}
    >
      🆘 Need help now?
    </button>
  )
}

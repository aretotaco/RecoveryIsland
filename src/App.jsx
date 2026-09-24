import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ConciergeVilla from './pages/ConciergeVilla'
import MoodDiaryCentre from './pages/MoodDiaryCentre'
import MindfulnessVilla from './pages/MindfulnessVilla'
import RelaxationVilla from './pages/RelaxationVilla'
import WellnessVilla from './pages/WellnessVilla'
import InspirationVilla from './pages/InspirationVilla'
import EmotionScales from './pages/EmotionScales'
import AuthPage from './pages/AuthPage'
import CrisisSupport from './pages/CrisisSupport'
import SettingsPage from './pages/SettingsPage'
import InsightsDashboard from './pages/InsightsDashboard'
import UserGuidePage from './pages/UserGuidePage'
import AdminExport from './pages/AdminExport'
import AuthHud from './components/AuthHud'
import CrisisHud from './components/CrisisHud'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AuthOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AuthHud />
          <CrisisHud />
          <Routes>
            <Route path="/login" element={<AuthOnlyRoute><AuthPage /></AuthOnlyRoute>} />
            <Route path="/crisis-support" element={<CrisisSupport />} />
            <Route path="/admin" element={<AdminExport />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/concierge" element={<ProtectedRoute><ConciergeVilla /></ProtectedRoute>} />
            <Route path="/mood-diary" element={<ProtectedRoute><MoodDiaryCentre /></ProtectedRoute>} />
            <Route path="/mindfulness" element={<ProtectedRoute><MindfulnessVilla /></ProtectedRoute>} />
            <Route path="/relaxation" element={<ProtectedRoute><RelaxationVilla /></ProtectedRoute>} />
            <Route path="/wellness" element={<ProtectedRoute><WellnessVilla /></ProtectedRoute>} />
            <Route path="/inspiration" element={<ProtectedRoute><InspirationVilla /></ProtectedRoute>} />
            {/* AI Companion isn't ready yet — see IslandMap's `comingSoon` flag.
                Route redirects home instead of being removed, so it's a one-line
                revert once the feature ships. */}
            <Route path="/ai-chatbot" element={<Navigate to="/" replace />} />
            <Route path="/emotion-scales" element={<ProtectedRoute><EmotionScales /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><InsightsDashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><UserGuidePage /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
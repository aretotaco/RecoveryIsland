import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ConciergeVilla from './pages/ConciergeVilla'
import MoodDiaryCentre from './pages/MoodDiaryCentre'
import MindfulnessVilla from './pages/MindfulnessVilla'
import RelaxationVilla from './pages/RelaxationVilla'
import WellnessVilla from './pages/WellnessVilla'
import InspirationVilla from './pages/InspirationVilla'
import AIChatbot from './pages/AIChatbot'
import EmotionScales from './pages/EmotionScales'
import AuthPage from './pages/AuthPage'
import AuthHud from './components/AuthHud'
import { AuthProvider, useAuth } from './context/AuthContext'

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
      <AuthProvider>
        <AuthHud />
        <Routes>
          <Route path="/login" element={<AuthOnlyRoute><AuthPage /></AuthOnlyRoute>} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/concierge" element={<ProtectedRoute><ConciergeVilla /></ProtectedRoute>} />
          <Route path="/mood-diary" element={<ProtectedRoute><MoodDiaryCentre /></ProtectedRoute>} />
          <Route path="/mindfulness" element={<ProtectedRoute><MindfulnessVilla /></ProtectedRoute>} />
          <Route path="/relaxation" element={<ProtectedRoute><RelaxationVilla /></ProtectedRoute>} />
          <Route path="/wellness" element={<ProtectedRoute><WellnessVilla /></ProtectedRoute>} />
          <Route path="/inspiration" element={<ProtectedRoute><InspirationVilla /></ProtectedRoute>} />
          <Route path="/ai-chatbot" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
          <Route path="/emotion-scales" element={<ProtectedRoute><EmotionScales /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
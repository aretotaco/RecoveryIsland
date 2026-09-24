import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buildSageContext } from '../lib/sageContext'
import { trackEvent } from '../lib/activityTracking'

const SYSTEM_PROMPT = `You are Sage, a warm and empathetic AI wellness companion living on Serenity Island. 

You specialise in:
- Mental wellbeing and emotional support
- Mindfulness and grounding techniques  
- CBT-based thought reframing
- Active listening and reflection
- Stress, anxiety, and mood support
- Positive psychology and resilience building

Your communication style:
- Warm, gentle, and non-judgmental
- Never diagnose or prescribe
- Always validate feelings before offering suggestions
- Use calming, nature-inspired language occasionally
- Keep responses concise but meaningful (3-5 sentences usually)
- Ask one thoughtful follow-up question to keep the conversation going
- If someone is in crisis, always direct them to professional help immediately

You are NOT a replacement for professional therapy. Always remind users of this gently when appropriate.`

export default function AIChatbot() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello, I'm Sage 🌿 Your wellness companion on Serenity Island. This is a safe, gentle space — no judgement, no rush. How are you feeling today?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT)
  const [showCrisisBanner, setShowCrisisBanner] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    let active = true

    buildSageContext().then(({ contextText, isCrisisTier }) => {
      if (!active) return
      if (contextText) setSystemPrompt(`${SYSTEM_PROMPT}\n\n${contextText}`)
      if (isCrisisTier) setShowCrisisBanner(true)
    }).catch(() => {})

    return () => { active = false }
  }, [isAuthenticated])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    trackEvent('feature_click', { villa: 'ai-chatbot', feature: 'ai-chatbot' })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: newMessages
        })
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment. 🌿'
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-page">

      {/* Background */}
      <div className="chat-bg">
        <div className="chat-orb orb1" />
        <div className="chat-orb orb2" />
      </div>

      {/* Back button */}
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Island
      </button>

      {/* Header */}
      <div className="chat-header">
        <div className="sage-avatar">🌿</div>
        <div>
          <h1 className="sage-name">Sage</h1>
          <p className="sage-status">
            <span className="status-dot" /> Wellness Companion · Always here
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="chat-disclaimer">
        ⚠️ Sage is an AI companion, not a licensed therapist. If you are in crisis, please contact a professional helpline immediately.
      </div>

      {showCrisisBanner && (
        <div style={{
          margin: '0 auto 16px', maxWidth: 640, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          padding: '12px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', fontSize: '0.85rem',
        }}>
          <span>Things have sounded really hard lately. Crisis Support resources are here if you need them.</span>
          <button
            onClick={() => navigate('/crisis-support')}
            style={{ padding: '6px 14px', borderRadius: 999, border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}
          >
            View resources
          </button>
          <button
            onClick={() => setShowCrisisBanner(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(252,165,165,0.6)', cursor: 'pointer', marginLeft: 'auto' }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="msg-avatar">🌿</div>
            )}
            <div className={`message-bubble ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row assistant">
            <div className="msg-avatar">🌿</div>
            <div className="message-bubble assistant typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Share how you're feeling... (Enter to send)"
          rows={1}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
        >
          ✦ Send
        </button>
      </div>

    </div>
  )
}
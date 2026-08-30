import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, '..', 'dist')

const app = express()
const port = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_, res) => {
  res.json({ ok: true, mode: 'supabase' })
})

app.post('/api/chat', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ reply: 'Chat is not configured yet. Add ANTHROPIC_API_KEY to your .env file.' })
  }

  const { messages, system } = req.body || {}

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages,
      }),
    })

    const data = await response.json()
    return res.status(200).json({ reply: data?.content?.[0]?.text || 'No response returned.' })
  } catch (error) {
    return res.status(500).json({ reply: 'Something went wrong. Please try again.' })
  }
})

app.delete('/api/account', async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ message: 'Account deletion is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to your server .env file.' })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData?.user) {
    return res.status(401).json({ message: 'Invalid or expired session' })
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id)
  if (deleteError) {
    return res.status(500).json({ message: deleteError.message || 'Unable to delete account' })
  }

  return res.status(200).json({ ok: true })
})

if (existsSync(distPath)) {
  app.use(express.static(distPath))

  app.get(/^\/(?!api\/).*/, (_, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Recovery Island server listening on http://localhost:${port}`)
})

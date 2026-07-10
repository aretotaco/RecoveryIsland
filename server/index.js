import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const localStorePath = join(__dirname, 'data', 'local-store.json')

const app = express()
const port = process.env.PORT || 3001
const mongoUri = process.env.MONGODB_URI
const jwtSecret = process.env.JWT_SECRET || 'recovery-island-dev-secret'
let dbMode = 'mongo'

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))

async function connectDb() {
  if (!mongoUri) {
    dbMode = 'local'
    return false
  }

  if (dbMode === 'local') return false
  if (mongoose.connection.readyState === 1) return true

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 })
    dbMode = 'mongo'
    return true
  } catch (error) {
    dbMode = 'offline'
    console.warn('MongoDB unavailable. The API will return 503 until Atlas is reachable.')
    return false
  }
}

async function loadLocalStore() {
  try {
    const raw = await readFile(localStorePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return { users: [], entries: [] }
  }
}

async function saveLocalStore(store) {
  await mkdir(dirname(localStorePath), { recursive: true })
  await writeFile(localStorePath, JSON.stringify(store, null, 2), 'utf8')
}

function toUserPayload(user) {
  if (!user) return null
  return {
    id: String(user._id || user.id),
    email: user.email,
    displayName: user.displayName,
    avatarConfig: user.avatarConfig || {},
  }
}

function toEntryPayload(entry) {
  return {
    _id: String(entry._id || entry.id),
    userId: String(entry.userId),
    category: entry.category,
    source: entry.source,
    entryDate: entry.entryDate,
    entryKey: entry.entryKey,
    payload: entry.payload || {},
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}

async function findUserByEmail(email) {
  if (dbMode === 'mongo') return User.findOne({ email })
  const store = await loadLocalStore()
  return store.users.find(user => user.email === email) || null
}

async function findUserById(id) {
  if (dbMode === 'mongo') return User.findById(id)
  const store = await loadLocalStore()
  return store.users.find(user => user.id === String(id)) || null
}

async function createUserRecord({ email, passwordHash, displayName }) {
  if (dbMode === 'mongo') {
    const user = await User.create({
      email,
      passwordHash,
      displayName,
    })
    return user
  }

  const store = await loadLocalStore()
  const user = {
    id: randomUUID(),
    email,
    passwordHash,
    displayName,
    avatarConfig: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  store.users.push(user)
  await saveLocalStore(store)
  return user
}

async function updateUserRecord(id, patch) {
  if (dbMode === 'mongo') {
    const user = await User.findByIdAndUpdate(id, { $set: patch }, { new: true })
    return user
  }

  const store = await loadLocalStore()
  const index = store.users.findIndex(user => user.id === String(id))
  if (index === -1) return null
  store.users[index] = { ...store.users[index], ...patch, updatedAt: new Date().toISOString() }
  await saveLocalStore(store)
  return store.users[index]
}

async function findLocalUserForAuth(email) {
  const user = await findUserByEmail(email)
  return user
}

async function upsertEntryRecord({ userId, category, source, entryDate, entryKey, payload }) {
  if (dbMode === 'mongo') {
    const entry = await Entry.findOneAndUpdate(
      { userId, category, source, entryKey },
      {
        $set: {
          userId,
          category,
          source,
          entryDate,
          entryKey,
          payload: payload || {},
        },
      },
      { upsert: true, new: true }
    )
    return toEntryPayload(entry)
  }

  const store = await loadLocalStore()
  const now = new Date().toISOString()
  const index = store.entries.findIndex(entry =>
    entry.userId === String(userId) &&
    entry.category === category &&
    entry.source === source &&
    entry.entryKey === entryKey
  )

  const nextEntry = {
    id: index >= 0 ? store.entries[index].id : randomUUID(),
    userId: String(userId),
    category,
    source,
    entryDate,
    entryKey,
    payload: payload || {},
    createdAt: index >= 0 ? store.entries[index].createdAt : now,
    updatedAt: now,
  }

  if (index >= 0) store.entries[index] = nextEntry
  else store.entries.push(nextEntry)
  await saveLocalStore(store)
  return toEntryPayload(nextEntry)
}

async function listEntriesRecord({ userId, category, source, limit = 50 }) {
  if (dbMode === 'mongo') {
    const query = { userId }
    if (category) query.category = category
    if (source) query.source = source
    const entries = await Entry.find(query).sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 50, 200))
    return entries.map(toEntryPayload)
  }

  const store = await loadLocalStore()
  const entries = store.entries
    .filter(entry => String(entry.userId) === String(userId))
    .filter(entry => !category || entry.category === category)
    .filter(entry => !source || entry.source === source)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, Math.min(Number(limit) || 50, 200))
  return entries.map(toEntryPayload)
}

async function summarizeEntriesRecord(userId) {
  const entries = await listEntriesRecord({ userId, limit: 500 })
  const summary = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1
    return acc
  }, {})

  return {
    totalEntries: entries.length,
    byCategory: summary,
    recentEntries: entries.slice(0, 10),
  }
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: 'Traveller' },
  avatarConfig: { type: Object, default: {} },
}, { timestamps: true })

const entrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true, index: true },
  source: { type: String, required: true, index: true },
  entryDate: { type: String, required: true, index: true },
  entryKey: { type: String, required: true, index: true },
  payload: { type: Object, default: {} },
}, { timestamps: true })
entrySchema.index({ userId: 1, category: 1, source: 1, entryKey: 1 }, { unique: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Entry = mongoose.models.Entry || mongoose.model('Entry', entrySchema)

function signToken(user) {
  return jwt.sign({ sub: String(user._id || user.id), email: user.email }, jwtSecret, { expiresIn: '7d' })
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Missing auth token' })

  try {
    req.auth = jwt.verify(token, jwtSecret)
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired auth token' })
  }
}

function normalizeDisplayName(value) {
  const name = String(value || '').trim()
  return name || 'Traveller'
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true, dbMode })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body || {}
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const connected = await connectDb()
    if (!connected) return res.status(503).json({ message: 'MongoDB is unavailable right now' })
    const normalizedEmail = String(email).toLowerCase()
    const existing = await findUserByEmail(normalizedEmail)
    if (existing) return res.status(409).json({ message: 'An account with that email already exists' })

    const passwordHash = await bcrypt.hash(String(password), 10)
    const user = await createUserRecord({
      email: normalizedEmail,
      passwordHash,
      displayName: normalizeDisplayName(displayName),
    })

    return res.status(201).json({
      token: signToken(user),
      user: toUserPayload(user),
    })
  } catch (error) {
    console.error('REGISTER_ERROR', error)
    return res.status(500).json({ message: 'Unable to register account' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const connected = await connectDb()
    if (!connected) return res.status(503).json({ message: 'MongoDB is unavailable right now' })
    const normalizedEmail = String(email).toLowerCase()
    const user = await findLocalUserForAuth(normalizedEmail)
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const ok = await bcrypt.compare(String(password), user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' })

    return res.json({
      token: signToken(user),
      user: toUserPayload(user),
    })
  } catch (error) {
    console.error('LOGIN_ERROR', error)
    return res.status(500).json({ message: 'Unable to log in' })
  }
})

app.get('/api/auth/me', authRequired, async (req, res) => {
  try {
    const connected = await connectDb()
    if (!connected) return res.status(503).json({ message: 'MongoDB is unavailable right now' })
    const user = await findUserById(req.auth.sub)
    if (!user) return res.status(404).json({ message: 'User not found' })

    return res.json({
      user: toUserPayload(user),
    })
  } catch {
    return res.status(500).json({ message: 'Unable to load profile' })
  }
})

app.put('/api/profile', authRequired, async (req, res) => {
  try {
    const { displayName, avatarConfig } = req.body || {}
    const connected = await connectDb()
    if (!connected) return res.status(503).json({ message: 'MongoDB is unavailable right now' })
    const user = await updateUserRecord(req.auth.sub, {
      ...(displayName !== undefined ? { displayName: normalizeDisplayName(displayName) } : {}),
      ...(avatarConfig !== undefined ? { avatarConfig } : {}),
    })

    if (!user) return res.status(404).json({ message: 'User not found' })

    return res.json({
      user: toUserPayload(user),
    })
  } catch {
    return res.status(500).json({ message: 'Unable to update profile' })
  }
})

app.get('/api/profile', authRequired, async (req, res) => {
  try {
    const connected = await connectDb()
    if (!connected) return res.status(503).json({ message: 'MongoDB is unavailable right now' })
    const user = await findUserById(req.auth.sub)
    if (!user) return res.status(404).json({ message: 'User not found' })

    return res.json({
      user: toUserPayload(user),
    })
  } catch {
    return res.status(500).json({ message: 'Unable to load profile' })
  }
})

app.post('/api/entries', authRequired, async (req, res) => {
  try {
    const { category, source, entryDate, entryKey, payload } = req.body || {}
    if (!category || !source || !entryDate) {
      return res.status(400).json({ message: 'category, source, and entryDate are required' })
    }

    const key = String(entryKey || `${entryDate}:${category}:${source}:${Date.now()}`)
    const connected = await connectDb()
    if (!connected) return res.status(503).json({ message: 'MongoDB is unavailable right now' })
    const entry = await upsertEntryRecord({
      userId: req.auth.sub,
      category,
      source,
      entryDate,
      entryKey: key,
      payload: payload || {},
    })

    return res.status(201).json({ entry })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save entry' })
  }
})

app.get('/api/entries', authRequired, async (req, res) => {
  try {
    const { category, source, limit = 50 } = req.query
    const connected = await connectDb()
    if (!connected) return res.status(503).json({ message: 'MongoDB is unavailable right now' })
    const entries = await listEntriesRecord({
      userId: req.auth.sub,
      category,
      source,
      limit,
    })
    return res.json({ entries })
  } catch {
    return res.status(500).json({ message: 'Unable to load entries' })
  }
})

app.get('/api/summary', authRequired, async (req, res) => {
  try {
    const connected = await connectDb()
    if (!connected) return res.status(503).json({ message: 'MongoDB is unavailable right now' })
    return res.json(await summarizeEntriesRecord(req.auth.sub))
  } catch {
    return res.status(500).json({ message: 'Unable to load summary' })
  }
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

app.listen(port, async () => {
  await connectDb()
  console.log(`Recovery Island API listening on http://localhost:${port} (${dbMode})`)
})

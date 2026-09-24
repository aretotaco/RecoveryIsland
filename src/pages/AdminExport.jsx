import { useState } from 'react'

// Fixed categorical order, validated against this page's dark AND light
// surfaces (see the dataviz palette checks run for this page, and the
// matching --chart-* tokens in index.css). Same villa always gets the same
// color across every chart on this page, in either theme.
const VILLA_COLORS = {
  concierge: 'var(--chart-concierge)',
  'mood-diary': 'var(--chart-mood-diary)',
  mindfulness: 'var(--chart-mindfulness)',
  relaxation: 'var(--chart-relaxation)',
  wellness: 'var(--chart-wellness)',
  inspiration: 'var(--chart-inspiration)',
  'ai-chatbot': 'var(--chart-ai-chatbot)',
}
const VILLA_LABELS = {
  concierge: 'Concierge',
  'mood-diary': 'Mood Diary Centre',
  mindfulness: 'Mindfulness Villa',
  relaxation: 'Relaxation Villa',
  wellness: 'Wellness Villa',
  inspiration: 'Inspiration Villa',
  'ai-chatbot': 'AI Companion',
}

const card = { background: 'var(--ri-card-bg-strong)', border: '1px solid var(--ri-card-border)', borderRadius: 20, padding: 22 }
const sectionTitle = { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', margin: '0 0 16px', color: 'var(--ri-text-primary)' }
const mutedText = { color: 'var(--ri-text-secondary)', fontSize: '0.85rem' }

function StatTile({ label, value }) {
  return (
    <div style={{ background: 'var(--ri-card-bg)', border: '1px solid var(--ri-card-border)', borderRadius: 16, padding: '16px 18px' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--ri-text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--ri-text-primary)' }}>{value}</div>
    </div>
  )
}

// Column chart: sessions per relative study week (Week 1 = the account's
// or the study's first week, not the calendar's ISO week number — see
// buildWeekSeries in server/index.js). Rounded caps at the data-end, square
// at the baseline, direct value labels (per the mark spec — bar/column),
// plus a hover tooltip with the real date range since "Week 6" alone
// doesn't say which calendar dates that covers.
function WeeklySessionsChart({ data }) {
  const [hovered, setHovered] = useState(null)
  if (!data || data.length === 0) return <p style={mutedText}>No sessions logged yet.</p>
  const max = Math.max(1, ...data.map(d => d.count))
  // Bars get cramped below ~28px each once a participant has many weeks of
  // history; let the row scroll horizontally instead of squeezing them.
  const barWidth = Math.max(24, Math.min(36, Math.floor(760 / data.length)))

  return (
    <div style={{ overflowX: data.length > 20 ? 'auto' : 'visible' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, minWidth: data.length > 20 ? data.length * (barWidth + 8) : undefined }}>
        {data.map((d, i) => {
          const h = Math.max(2, Math.round((d.count / max) * 100))
          return (
            <div
              key={d.week}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'default' }}
            >
              {hovered === i && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translate(-50%, -6px)',
                  background: 'var(--ri-card-bg-strong)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 8, padding: '6px 10px',
                  fontSize: '0.72rem', color: 'var(--ri-text-primary)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 5,
                }}>
                  <strong>Week {d.weekNumber}</strong> · {d.label} · {d.count} session{d.count === 1 ? '' : 's'}
                </div>
              )}
              <div style={{ fontSize: '0.72rem', color: 'var(--ri-text-secondary)', fontWeight: 600 }}>{d.count}</div>
              <div style={{ width: '100%', maxWidth: barWidth, height: h, background: hovered === i ? 'var(--chart-blue-hover)' : 'var(--chart-blue)', borderRadius: '4px 4px 0 0', transition: 'background 0.15s' }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, minWidth: data.length > 20 ? data.length * (barWidth + 8) : undefined }}>
        {data.map((d, i) => (
          <div
            key={d.week}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ flex: 1, textAlign: 'center', fontSize: '0.62rem', color: hovered === i ? 'var(--ri-text-primary)' : 'var(--ri-text-muted)' }}
          >
            W{d.weekNumber}
          </div>
        ))}
      </div>
    </div>
  )
}

// Horizontal bar chart: avg villa visits per participant. Each bar already
// carries its own category label, so no separate legend box is needed.
function VillaBarChart({ data }) {
  if (!data || data.length === 0) return <p style={mutedText}>No villa visits logged yet.</p>
  const max = Math.max(1, ...data.map(d => d.total))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(d => {
        const w = Math.max(3, Math.round((d.total / max) * 100))
        const color = VILLA_COLORS[d.villa] || '#898781'
        return (
          <div key={d.villa} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 130, fontSize: '0.78rem', color: 'var(--ri-text-secondary)', flexShrink: 0 }}>{VILLA_LABELS[d.villa] || d.villa}</div>
            <div style={{ flex: 1, background: 'var(--ri-card-bg)', borderRadius: 4, height: 18 }}>
              <div style={{ width: `${w}%`, height: '100%', background: color, borderRadius: 4 }} />
            </div>
            <div style={{ width: 130, fontSize: '0.74rem', color: 'var(--ri-text-secondary)', textAlign: 'right', flexShrink: 0 }}>
              {d.total} visits · {d.avgPerParticipant} avg
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Ranked feature-usage list. Magnitude, not identity, so this is a single
// sequential hue rather than the categorical villa colors.
function FeatureUsageList({ data }) {
  if (!data || data.length === 0) return <p style={mutedText}>No feature usage logged yet.</p>
  const max = Math.max(1, ...data.map(d => d.total))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => {
        const w = Math.max(3, Math.round((d.total / max) * 100))
        return (
          <div key={`${d.villa}-${d.feature}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 210, fontSize: '0.76rem', color: 'var(--ri-text-secondary)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {VILLA_LABELS[d.villa] || d.villa || 'Unknown'} — {d.feature}
            </div>
            <div style={{ flex: 1, background: 'var(--ri-card-bg)', borderRadius: 4, height: 14 }}>
              <div style={{ width: `${w}%`, height: '100%', background: 'var(--chart-blue)', borderRadius: 4 }} />
            </div>
            <div style={{ width: 32, fontSize: '0.76rem', color: 'var(--ri-text-secondary)', textAlign: 'right', flexShrink: 0 }}>{d.total}</div>
          </div>
        )
      })}
    </div>
  )
}

async function downloadExport(key, studyId) {
  const url = studyId ? `/api/admin/export-excel?studyId=${encodeURIComponent(studyId)}` : '/api/admin/export-excel'
  const response = await fetch(url, { headers: { 'x-admin-key': key } })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `Export failed (${response.status})`)
  }
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  const suffix = studyId ? `-${studyId}` : ''
  link.download = `recovery-island-export${suffix}-${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

function ParticipantDetail({ detail, adminKey, onExportStatus }) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await downloadExport(adminKey, detail.studyId)
      onExportStatus('Downloaded.')
    } catch (err) {
      onExportStatus(err.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ ...card, marginTop: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', margin: 0, color: 'var(--ri-text-primary)' }}>{detail.studyId}</h3>
          <p style={{ ...mutedText, margin: '4px 0 0' }}>
            Joined {new Date(detail.createdAt).toLocaleDateString()} · {detail.totalSessions} total sessions
          </p>
        </div>
        <button
          disabled={exporting}
          onClick={handleExport}
          style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#111827', fontWeight: 700, cursor: exporting ? 'default' : 'pointer', fontSize: '0.85rem' }}
        >
          {exporting ? 'Preparing...' : 'Export this participant'}
        </button>
      </div>

      <h4 style={{ ...sectionTitle, fontSize: '1.1rem' }}>Sessions per week</h4>
      <WeeklySessionsChart data={detail.sessionsByWeek} />

      <h4 style={{ ...sectionTitle, fontSize: '1.1rem', marginTop: 24 }}>Feature usage</h4>
      <FeatureUsageList data={detail.featureUsage} />
    </div>
  )
}

export default function AdminExport() {
  const [key, setKey] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [gateStatus, setGateStatus] = useState('')
  const [gateBusy, setGateBusy] = useState(false)

  const [overview, setOverview] = useState(null)
  const [exportingAll, setExportingAll] = useState(false)
  const [status, setStatus] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [participants, setParticipants] = useState([])
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchStatus, setSearchStatus] = useState('')

  async function adminFetch(path, currentKey) {
    const response = await fetch(path, { headers: { 'x-admin-key': currentKey } })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.message || `Request failed (${response.status})`)
    }
    return response.json()
  }

  async function handleUnlock() {
    if (!key.trim()) {
      setGateStatus('Enter the admin key first.')
      return
    }
    setGateBusy(true)
    setGateStatus('Checking key...')
    try {
      const trimmedKey = key.trim()
      const [overviewData, participantsData] = await Promise.all([
        adminFetch('/api/admin/overview', trimmedKey),
        adminFetch('/api/admin/participants', trimmedKey),
      ])
      setAdminKey(trimmedKey)
      setOverview(overviewData)
      setParticipants(participantsData.participants)
      setUnlocked(true)
      setGateStatus('')
    } catch (err) {
      setGateStatus(err.message || 'Unable to unlock the dashboard')
    } finally {
      setGateBusy(false)
    }
  }

  async function handleExportAll() {
    setExportingAll(true)
    setStatus('Preparing export...')
    try {
      await downloadExport(adminKey)
      setStatus('Downloaded.')
    } catch (err) {
      setStatus(err.message || 'Export failed')
    } finally {
      setExportingAll(false)
    }
  }

  async function handleSelectParticipant(studyId) {
    setDetailLoading(true)
    setSearchStatus('')
    try {
      const detail = await adminFetch(`/api/admin/participants/${encodeURIComponent(studyId)}`, adminKey)
      setSelectedDetail(detail)
    } catch (err) {
      setSearchStatus(err.message || 'Could not load that participant')
      setSelectedDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const filteredParticipants = searchTerm.trim()
    ? participants.filter(p => p.studyId.toUpperCase().includes(searchTerm.trim().toUpperCase()))
    : participants

  if (!unlocked) {
    return (
      // height + overflowY (not minHeight) because body itself is locked to
      // 100vh/overflow:hidden globally (see index.css, for the island map's
      // fixed viewport) — every scrollable page needs its own scroll region,
      // the same pattern .villa-page uses.
      <div style={{ height: '100vh', overflowY: 'auto', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--ri-page-bg-navy)' }}>
        <div style={{ width: '100%', maxWidth: 460, borderRadius: 24, padding: 28, background: 'var(--ri-card-bg-strong)', border: '1px solid var(--ri-card-border)', color: 'var(--ri-text-primary)' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', margin: '0 0 8px' }}>Researcher Dashboard</h1>
          <p style={{ color: 'var(--ri-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
            Enter the admin key to view participant analytics, browse individual data, and export to Excel — identified only by Study ID.
          </p>
          <input
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            type="password"
            placeholder="Admin key"
            style={{ width: '100%', padding: '13px 14px', borderRadius: 14, border: '1px solid var(--ri-input-border)', background: 'var(--ri-input-bg)', color: 'var(--ri-text-primary)', marginBottom: 14 }}
          />
          <button
            disabled={gateBusy}
            onClick={handleUnlock}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#111827', fontWeight: 800, cursor: gateBusy ? 'default' : 'pointer' }}
          >
            {gateBusy ? 'Checking...' : 'Unlock Dashboard'}
          </button>
          {gateStatus && <p style={{ marginTop: 14, color: 'var(--ri-text-secondary)', fontSize: '0.85rem' }}>{gateStatus}</p>}
        </div>
      </div>
    )
  }

  return (
    // height + overflowY (not minHeight) for the same reason as the gate
    // screen above — body is locked to 100vh globally. Extra top padding
    // clears the globally fixed AuthHud pill (top:16, right:16 — see
    // src/components/AuthHud.jsx), which renders on every route including
    // this one and would otherwise sit on top of the "Export everyone's
    // data" button.
    <div style={{ height: '100vh', overflowY: 'auto', padding: '90px 24px 60px', background: 'var(--ri-page-bg-navy)', color: 'var(--ri-text-primary)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.1rem', margin: 0 }}>Researcher Dashboard</h1>
            <p style={{ ...mutedText, marginTop: 6 }}>Participant engagement analytics, identified only by Study ID.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button
              disabled={exportingAll}
              onClick={handleExportAll}
              style={{ padding: '12px 20px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#111827', fontWeight: 800, cursor: exportingAll ? 'default' : 'pointer' }}
            >
              {exportingAll ? 'Preparing...' : "Export everyone's data"}
            </button>
            {status && <p style={{ marginTop: 8, ...mutedText }}>{status}</p>}
          </div>
        </div>

        {/* Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatTile label="Total participants" value={overview.totalParticipants} />
          <StatTile label="Sessions this week" value={overview.sessionsThisWeek} />
          <StatTile label="Total sessions" value={overview.totalSessions} />
          <StatTile label="Avg features used / participant" value={overview.avgFeaturesPerParticipant} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18, marginBottom: 18 }}>
          <div style={card}>
            <h2 style={sectionTitle}>Sessions per week</h2>
            <WeeklySessionsChart data={overview.sessionsByWeek} />
          </div>
          <div style={card}>
            <h2 style={sectionTitle}>Average visits per villa</h2>
            <VillaBarChart data={overview.avgVisitsPerVilla} />
          </div>
        </div>

        <div style={{ ...card, marginBottom: 28 }}>
          <h2 style={sectionTitle}>Most-used features</h2>
          <FeatureUsageList data={overview.topFeatures} />
        </div>

        {/* Participant lookup */}
        <div style={card}>
          <h2 style={sectionTitle}>Find a participant</h2>
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Study ID..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--ri-input-border)', background: 'var(--ri-input-bg)', color: 'var(--ri-text-primary)', marginBottom: 16 }}
          />

          <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--ri-card-border)', borderRadius: 12 }}>
            {filteredParticipants.length === 0 && (
              <p style={{ ...mutedText, padding: 16 }}>No participants match "{searchTerm}".</p>
            )}
            {filteredParticipants.map(p => (
              <button
                key={p.studyId}
                onClick={() => handleSelectParticipant(p.studyId)}
                style={{
                  display: 'flex', justifyContent: 'space-between', width: '100%', padding: '12px 16px',
                  background: selectedDetail?.studyId === p.studyId ? 'rgba(245,158,11,0.12)' : 'transparent',
                  border: 'none', borderBottom: '1px solid var(--ri-card-bg)', color: 'var(--ri-text-primary)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600 }}>{p.studyId}</span>
                <span style={mutedText}>{p.totalSessions} sessions · last active {p.lastActive ? new Date(p.lastActive).toLocaleDateString() : '—'}</span>
              </button>
            ))}
          </div>

          {detailLoading && <p style={{ ...mutedText, marginTop: 14 }}>Loading participant...</p>}
          {searchStatus && <p style={{ marginTop: 14, color: 'rgba(255,180,120,0.9)', fontSize: '0.85rem' }}>{searchStatus}</p>}
        </div>

        {selectedDetail && !detailLoading && (
          <ParticipantDetail detail={selectedDetail} adminKey={adminKey} onExportStatus={setSearchStatus} />
        )}
      </div>
    </div>
  )
}

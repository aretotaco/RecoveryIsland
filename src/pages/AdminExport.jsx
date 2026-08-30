import { useState } from 'react'

export default function AdminExport() {
  const [key, setKey] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    if (!key.trim()) {
      setStatus('Enter the admin export key first.')
      return
    }

    setBusy(true)
    setStatus('Preparing export...')

    try {
      const response = await fetch('/api/admin/export-excel', {
        headers: { 'x-admin-key': key.trim() },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || `Export failed (${response.status})`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recovery-island-export-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setStatus('Downloaded.')
    } catch (err) {
      setStatus(err.message || 'Export failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(180deg, #0f172a, #111827 60%, #09090b)' }}>
      <div style={{ width: '100%', maxWidth: 460, borderRadius: 24, padding: 28, background: 'rgba(17,24,39,0.78)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', margin: '0 0 8px' }}>Admin Data Export</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
          Downloads every participant's mood, journal, assessment, and wellness data as a single Excel workbook, identified only by Study ID.
        </p>
        <input
          value={key}
          onChange={e => setKey(e.target.value)}
          type="password"
          placeholder="Admin export key"
          style={{ width: '100%', padding: '13px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: 14 }}
        />
        <button
          disabled={busy}
          onClick={handleDownload}
          style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#111827', fontWeight: 800, cursor: busy ? 'default' : 'pointer' }}
        >
          {busy ? 'Preparing...' : 'Download Excel export'}
        </button>
        {status && <p style={{ marginTop: 14, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{status}</p>}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Eye, CheckCircle, FileText, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SHARED_STYLES } from '../../shared-styles'  // si centralisé

const STATUS_QUOTE: Record<string, { label: string; color: string; bg: string }> = {
  draft:    { label: 'Brouillon', color: '#9ca3af', bg: 'rgba(156,163,175,.12)' },
  sent:     { label: 'Envoyé',    color: '#6c8dff', bg: 'rgba(108,141,255,.12)' },
  accepted: { label: 'Accepté',   color: '#34d399', bg: 'rgba(52,211,153,.12)' },
  expired:  { label: 'Expiré',    color: '#f87171', bg: 'rgba(248,113,113,.12)' },
  rejected: { label: 'Rejeté',    color: '#f87171', bg: 'rgba(248,113,113,.12)' },
  converted:{ label: 'Converti',  color: '#a78bfa', bg: 'rgba(167,139,250,.12)' },
}

export function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchQuotes() }, [])

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes')
      setQuotes(response.data)
      setTimeout(() => setLoaded(true), 50)
    } catch (error) {
      console.error('Error fetching quotes:', error)
      alert('Erreur lors du chargement des devis')
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async (id: string) => {
    if (!confirm('Convertir ce devis en facture ?')) return
    setConvertingId(id)
    try {
      const response = await api.post(`/quotes/${id}/convert`)
      navigate(`/invoices/${response.data.invoiceId}`)
    } catch {
      alert('Erreur lors de la conversion')
    } finally {
      setConvertingId(null)
    }
  }

  const handleDownloadPdf = async (id: string, number: string) => {
    setDownloadingId(id)
    try {
      const response = await api.get(`/quotes/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `devis-${number}.pdf`)
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors du téléchargement du PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const filtered = quotes.filter(q =>
    q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingScreen />

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header */}
          <div className={`fade-up ${loaded ? 'show' : ''}`} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px' }}>Devis</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{filtered.length} devis</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              {/* Recherche */}
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 36, width: 240 }}
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={() => navigate('/quotes/new')}>
                <Plus size={16} /> Nouveau Devis
              </button>
            </div>
          </div>

          {/* Tableau */}
          <div className={`glass fade-up delay-1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>N° Devis</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th className="right">Total</th>
                    <th className="center">Statut</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>Aucun devis trouvé</td></tr>
                  )}
                  {filtered.map(q => {
                    const s = STATUS_QUOTE[q.status] ?? STATUS_QUOTE.draft
                    return (
                      <tr key={q.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', background: 'rgba(108,141,255,.1)', padding: '3px 8px', borderRadius: 6 }}>
                            {q.quote_number}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{q.customer_name || q.contact_name || '-'}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                          {new Date(q.issue_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="right" style={{ fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 15 }}>
                          {q.total.toLocaleString()} DZD
                        </td>
                        <td className="center">
                          <span className="status-pill" style={{ color: s.color, background: s.bg }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="right">
                          <button className="icon-btn blue" title="Voir" onClick={() => navigate(`/quotes/${q.id}`)}>
                            <Eye size={16} />
                          </button>
                          <button className="icon-btn orange" title="Télécharger PDF" onClick={() => handleDownloadPdf(q.id, q.quote_number)} disabled={downloadingId === q.id}>
                            {downloadingId === q.id ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
                          </button>
                          {q.status === 'draft' && (
                            <button className="icon-btn green" title="Convertir en facture" onClick={() => handleConvert(q.id)} disabled={convertingId === q.id}>
                              {convertingId === q.id ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function LoadingScreen() {
  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader" />
      </div>
    </>
  )
}

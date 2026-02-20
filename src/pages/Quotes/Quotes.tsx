import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Eye, CheckCircle, FileText, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BASE_STYLES, STATUS_QUOTE } from './src/shared-styles'

interface Quote {
  id: string; quote_number: string; issue_date: string
  expiry_date: string | null; total: number; status: string
  customer_name: string; contact_name: string | null
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
      const r = await api.get('/quotes'); setQuotes(r.data)
      setTimeout(() => setLoaded(true), 50)
    } catch { alert('Erreur lors du chargement des devis') }
    finally { setLoading(false) }
  }

  const handleConvert = async (id: string) => {
    if (!confirm('Convertir ce devis en facture ?')) return
    setConvertingId(id)
    try { const r = await api.post(`/quotes/${id}/convert`); navigate(`/invoices/${r.data.invoiceId}`) }
    catch { alert('Erreur lors de la conversion') }
    finally { setConvertingId(null) }
  }

  const handleDownloadPdf = async (id: string, number: string) => {
    setDownloadingId(id)
    try {
      const r = await api.get(`/quotes/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a'); a.href = url
      a.setAttribute('download', `devis-${number}.pdf`)
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch { alert('Erreur lors du téléchargement du PDF') }
    finally { setDownloadingId(null) }
  }

  const filtered = quotes.filter(q =>
    q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (q.contact_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loader />

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div className={`flex flex-wrap justify-between items-center gap-4 mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}>Devis</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{filtered.length} devis</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input className="f-input" style={{ paddingLeft: 36, width: 240 }} placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => navigate('/quotes/new')}><Plus size={16} /> Nouveau Devis</button>
            </div>
          </div>

          <div className={`glass fade-up d1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr>
                  <th>N° Devis</th><th>Client</th><th>Date</th>
                  <th>Expiration</th><th className="right">Total</th>
                  <th className="center">Statut</th><th className="right">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>Aucun devis trouvé</td></tr>}
                  {filtered.map(q => {
                    const s = STATUS_QUOTE[q.status] ?? STATUS_QUOTE.draft
                    return (
                      <tr key={q.id}>
                        <td><span className="ref-badge">{q.quote_number}</span></td>
                        <td style={{ fontWeight: 500 }}>{q.customer_name || q.contact_name || '-'}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(q.issue_date).toLocaleDateString('fr-FR')}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{q.expiry_date ? new Date(q.expiry_date).toLocaleDateString('fr-FR') : '-'}</td>
                        <td className="right" style={{ fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>{q.total.toLocaleString()} DZD</td>
                        <td className="center"><span className="status-pill" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                        <td className="right">
                          <button className="icon-btn blue" title="Voir" onClick={() => navigate(`/quotes/${q.id}`)}><Eye size={16} /></button>
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

function Loader() {
  return (
    <>
      <style>{`.loader{width:36px;height:36px;border:3px solid rgba(108,141,255,.2);border-top-color:#6c8dff;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" /></div>
    </>
  )
}



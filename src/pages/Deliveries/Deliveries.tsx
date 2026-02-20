// ═══════════════════════════════════════════════════════
// Deliveries.tsx
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Eye, FileText, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BASE_STYLES, STATUS_DELIVERY } from '../../shared-styles'

interface Delivery { id: string; delivery_number: string; delivery_date: string; total: number; status: string; customer_name: string }

export function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading]       = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [loaded, setLoaded]         = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchDeliveries() }, [])

  const fetchDeliveries = async () => {
    try { const r = await api.get('/deliveries'); setDeliveries(r.data); setTimeout(() => setLoaded(true), 50) }
    catch { alert('Erreur lors du chargement des bons de livraison') }
    finally { setLoading(false) }
  }

  const handleDownloadPdf = async (id: string, number: string) => {
    setDownloadingId(id)
    try {
      const r = await api.get(`/deliveries/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a'); a.href = url; a.setAttribute('download', `BL-${number}.pdf`)
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url)
    } catch { alert('Erreur lors du téléchargement du PDF') }
    finally { setDownloadingId(null) }
  }

  const filtered = deliveries.filter(d =>
    d.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loader />

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={`flex flex-wrap justify-between items-center gap-4 mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700 }}>Bons de Livraison</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{filtered.length} BL</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input className="f-input" style={{ paddingLeft: 36, width: 240 }} placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => navigate('/deliveries/new')}><Plus size={16} /> Nouveau BL</button>
            </div>
          </div>

          <div className={`glass fade-up d1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr>
                  <th>N° BL</th><th>Client</th><th>Date</th>
                  <th className="right">Total</th><th className="center">Statut</th><th className="right">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>Aucun bon de livraison trouvé</td></tr>}
                  {filtered.map(d => {
                    const s = STATUS_DELIVERY[d.status] ?? STATUS_DELIVERY.draft
                    return (
                      <tr key={d.id}>
                        <td><span className="ref-badge">{d.delivery_number}</span></td>
                        <td style={{ fontWeight: 500 }}>{d.customer_name}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(d.delivery_date).toLocaleDateString('fr-FR')}</td>
                        <td className="right" style={{ fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>{d.total.toLocaleString()} DZD</td>
                        <td className="center"><span className="status-pill" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                        <td className="right">
                          <button className="icon-btn blue" title="Voir" onClick={() => navigate(`/deliveries/${d.id}`)}><Eye size={16} /></button>
                          <button className="icon-btn orange" title="Télécharger PDF" onClick={() => handleDownloadPdf(d.id, d.delivery_number)} disabled={downloadingId === d.id}>
                            {downloadingId === d.id ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
                          </button>
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


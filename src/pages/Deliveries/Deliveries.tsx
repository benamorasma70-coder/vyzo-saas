import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Eye, FileText, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SHARED_STYLES } from '../../shared-styles'

interface Delivery {
  id: string
  delivery_number: string
  delivery_date: string
  total: number
  status: string
  customer_name: string
}

const STATUS_DELIVERY: Record<string, { label: string; color: string; bg: string }> = {
  draft:    { label: 'Brouillon', color: '#9ca3af', bg: 'rgba(156,163,175,.12)' },
  delivered:{ label: 'Livré',     color: '#34d399', bg: 'rgba(52,211,153,.12)' },
  invoiced: { label: 'Facturé',   color: '#a78bfa', bg: 'rgba(167,139,250,.12)' },
}

export function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/deliveries')
      setDeliveries(response.data)
      setTimeout(() => setLoaded(true), 50)
    } catch (error) {
      console.error('Error fetching deliveries:', error)
      alert('Erreur lors du chargement des bons de livraison')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (id: string, number: string) => {
    setDownloadingId(id)
    try {
      const response = await api.get(`/deliveries/${id}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `BL-${number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Erreur lors du téléchargement du PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const filtered = deliveries.filter(d =>
    d.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}>Bons de livraison</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{filtered.length} BL</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
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
              <button className="btn-primary" onClick={() => navigate('/deliveries/new')}>
                <Plus size={16} /> Nouveau BL
              </button>
            </div>
          </div>

          {/* Tableau */}
          <div className={`glass fade-up delay-1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>N° BL</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th className="right">Total</th>
                    <th className="center">Statut</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>Aucun bon de livraison trouvé</td></tr>
                  )}
                  {filtered.map((delivery) => {
                    const s = STATUS_DELIVERY[delivery.status] ?? STATUS_DELIVERY.draft
                    return (
                      <tr key={delivery.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', background: 'rgba(108,141,255,.1)', padding: '3px 8px', borderRadius: 6 }}>
                            {delivery.delivery_number}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{delivery.customer_name}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                          {new Date(delivery.delivery_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="right" style={{ fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 15 }}>
                          {delivery.total.toLocaleString()} DZD
                        </td>
                        <td className="center">
                          <span className="status-pill" style={{ color: s.color, background: s.bg }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="right">
                          <button className="icon-btn blue" title="Voir" onClick={() => navigate(`/deliveries/${delivery.id}`)}>
                            <Eye size={16} />
                          </button>
                          <button
                            className="icon-btn orange"
                            title="Télécharger PDF"
                            onClick={() => handleDownloadPdf(delivery.id, delivery.delivery_number)}
                            disabled={downloadingId === delivery.id}
                          >
                            {downloadingId === delivery.id ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
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

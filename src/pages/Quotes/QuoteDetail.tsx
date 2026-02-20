import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ArrowLeft } from 'lucide-react'
import { SHARED_STYLES } from '../../shared-styles'

interface QuoteItem {
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

interface Quote {
  id: string
  quote_number: string
  issue_date: string
  expiry_date: string | null
  total: number
  status: string
  notes: string | null
  customer_name: string
  items: QuoteItem[]
}

export function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (id) fetchQuote()
  }, [id])

  const fetchQuote = async () => {
    try {
      const response = await api.get(`/quotes/${id}`)
      setQuote(response.data)
      setTimeout(() => setLoaded(true), 50)
    } catch (error) {
      console.error('Error fetching quote:', error)
      alert('Erreur lors du chargement du devis')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!quote) return
    setUpdating(true)
    try {
      await api.patch(`/quotes/${id}/status`, { status: newStatus })
      setQuote({ ...quote, status: newStatus })
      alert('Statut mis à jour')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  const handleConvert = async () => {
    if (!confirm('Convertir ce devis en facture ?')) return
    setUpdating(true)
    try {
      const response = await api.post(`/quotes/${id}/convert`)
      navigate(`/invoices/${response.data.invoiceId}`)
    } catch (error) {
      console.error('Conversion error:', error)
      alert('Erreur lors de la conversion')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <LoadingScreen />
  if (!quote) return (
    <div className="root" style={{ textAlign: 'center', paddingTop: 50 }}>
      Devis introuvable
    </div>
  )

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button onClick={() => navigate('/quotes')} className="btn-ghost" style={{ marginBottom: 24 }}>
            <ArrowLeft size={16} /> Retour aux devis
          </button>

          <div className={`glass fade-up ${loaded ? 'show' : ''}`} style={{ padding: 24 }}>
            {/* En-tête */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>
                  Devis {quote.quote_number}
                </h1>
                <p style={{ color: 'var(--muted)' }}>
                  Créé le {new Date(quote.issue_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {quote.status === 'draft' && (
                  <button onClick={handleConvert} className="btn-primary">
                    Convertir en facture
                  </button>
                )}
                <select
                  value={quote.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                  className="input"
                  style={{ width: 150 }}
                >
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="rejected">Refusé</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
            </div>

            {/* Client */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
              <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Client</h2>
              <p>{quote.customer_name}</p>
            </div>

            {/* Articles */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
              <h2 style={{ fontWeight: 600, marginBottom: 16 }}>Articles</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="right">Qté</th>
                      <th className="right">P.U HT</th>
                      <th className="right">TVA %</th>
                      <th className="right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item) => {
                      const total = item.quantity * item.unit_price * (1 + item.tax_rate / 100)
                      return (
                        <tr key={item.id}>
                          <td>{item.description}</td>
                          <td className="right">{item.quantity}</td>
                          <td className="right">{item.unit_price.toFixed(2)} DZD</td>
                          <td className="right">{item.tax_rate}%</td>
                          <td className="right">{total.toFixed(2)} DZD</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 250 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                  <span>Total TTC :</span>
                  <span>{quote.total.toFixed(2)} DZD</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
                <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Notes</h2>
                <p style={{ color: 'var(--muted)' }}>{quote.notes}</p>
              </div>
            )}
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

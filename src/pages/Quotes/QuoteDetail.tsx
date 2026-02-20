import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ArrowLeft } from 'lucide-react'
import { BASE_STYLES, STATUS_QUOTE } from '../shared-styles'

interface QuoteItem { id: string; product_id: string|null; description: string; quantity: number; unit_price: number; tax_rate: number }
interface Quote { id: string; quote_number: string; issue_date: string; expiry_date: string|null; total: number; status: string; notes: string|null; customer_name: string; items: QuoteItem[] }

export function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { if (id) fetchQuote() }, [id])

  const fetchQuote = async () => {
    try { const r = await api.get(`/quotes/${id}`); setQuote(r.data); setTimeout(() => setLoaded(true), 50) }
    catch { alert('Erreur lors du chargement du devis') }
    finally { setLoading(false) }
  }

  const updateStatus = async (newStatus: string) => {
    if (!quote) return; setUpdating(true)
    try { await api.patch(`/quotes/${id}/status`, { status: newStatus }); setQuote({ ...quote, status: newStatus }) }
    catch { alert('Erreur lors de la mise à jour') }
    finally { setUpdating(false) }
  }

  const handleConvert = async () => {
    if (!confirm('Convertir ce devis en facture ?')) return; setUpdating(true)
    try { const r = await api.post(`/quotes/${id}/convert`); navigate(`/invoices/${r.data.invoiceId}`) }
    catch { alert('Erreur lors de la conversion') }
    finally { setUpdating(false) }
  }

  if (loading) return <Loader />
  if (!quote) return <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: 'DM Sans,sans-serif' }}>Devis introuvable</div>

  const s = STATUS_QUOTE[quote.status] ?? STATUS_QUOTE.draft
  const subtotal = quote.items.reduce((a, i) => a + i.quantity * i.unit_price, 0)

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button className={`btn-ghost mb-8 fade-up ${loaded ? 'show' : ''}`} onClick={() => navigate('/quotes')}><ArrowLeft size={15} /> Retour aux devis</button>

          <div className={`glass p-8 fade-up d1 ${loaded ? 'show' : ''}`}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700 }}>{quote.quote_number}</h1>
                  <span className="status-pill" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Émis le {new Date(quote.issue_date).toLocaleDateString('fr-FR')}
                  {quote.expiry_date && ` · Expire le ${new Date(quote.expiry_date).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {quote.status === 'draft' && (
                  <button className="btn-success" onClick={handleConvert} disabled={updating}>Convertir en facture</button>
                )}
                <select className="f-input" style={{ width: 'auto' }} value={quote.status} onChange={e => updateStatus(e.target.value)} disabled={updating}>
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="rejected">Refusé</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
            </div>

            <hr className="divider" />
            <SectionLabel>Client</SectionLabel>
            <p style={{ fontWeight: 600, fontSize: 16, marginTop: 8 }}>{quote.customer_name}</p>

            <hr className="divider" />
            <SectionLabel>Articles</SectionLabel>
            <div style={{ overflowX: 'auto', marginTop: 16 }}>
              <table className="det-table">
                <thead><tr>
                  <th>Description</th><th className="right">Qté</th>
                  <th className="right">P.U HT</th><th className="right">TVA %</th><th className="right">Total TTC</th>
                </tr></thead>
                <tbody>
                  {quote.items.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.description}</td>
                      <td className="right" style={{ color: 'var(--muted)' }}>{item.quantity}</td>
                      <td className="right" style={{ color: 'var(--muted)' }}>{item.unit_price.toFixed(2)} DZD</td>
                      <td className="right" style={{ color: 'var(--muted)' }}>{item.tax_rate}%</td>
                      <td className="right" style={{ fontWeight: 600 }}>{(item.quantity * item.unit_price * (1 + item.tax_rate / 100)).toFixed(2)} DZD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 280 }}>
                <TotalRow label="Total HT" value={`${subtotal.toFixed(2)} DZD`} />
                <TotalRow label="Total TVA" value={`${(quote.total - subtotal).toFixed(2)} DZD`} />
                <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Total TTC</span>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {quote.total.toFixed(2)} DZD
                  </span>
                </div>
              </div>
            </div>

            {quote.notes && (<>
              <hr className="divider" />
              <SectionLabel>Notes</SectionLabel>
              <p style={{ fontSize: 14, lineHeight: 1.7, background: 'rgba(255,255,255,.03)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', marginTop: 10 }}>{quote.notes}</p>
            </>)}
          </div>
        </div>
      </div>
    </>
  )
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--muted)' }}>{children}</p>
)
const TotalRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
    <span style={{ color: 'var(--muted)' }}>{label}</span><span>{value}</span>
  </div>
)
function Loader() {
  return (
    <>
      <style>{`.loader{width:36px;height:36px;border:3px solid rgba(108,141,255,.2);border-top-color:#6c8dff;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" /></div>
    </>
  )
}

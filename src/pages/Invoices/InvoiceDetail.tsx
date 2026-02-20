import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ArrowLeft, Download } from 'lucide-react'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  total: number
  paid_amount: number
  status: string
  customer_name: string
  notes?: string
  items: InvoiceItem[]
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  paid:    { label: 'Payée',              color: '#34d399', bg: 'rgba(52,211,153,.12)'  },
  overdue: { label: 'En retard',          color: '#f87171', bg: 'rgba(248,113,113,.12)' },
  partial: { label: 'Partiellement payée',color: '#fbbf24', bg: 'rgba(251,191,36,.12)'  },
  sent:    { label: 'Envoyée',            color: '#6c8dff', bg: 'rgba(108,141,255,.12)' },
  draft:   { label: 'Brouillon',          color: '#9ca3af', bg: 'rgba(156,163,175,.12)' },
}

const STYLES = `
  :root {
    --bg: #0d0f14; --surface: rgba(255,255,255,0.045);
    --border: rgba(255,255,255,0.08); --accent: #6c8dff;
    --accent2: #a78bfa; --text: #e8eaf0; --muted: #6b7280;
    --success: #34d399; --danger: #f87171;
  }
  .det-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg); min-height: 100vh;
    color: var(--text); padding: 40px 24px;
  }
  .det-root::before {
    content:''; position:fixed; top:-200px; left:-200px;
    width:700px; height:700px;
    background: radial-gradient(circle, rgba(108,141,255,.10) 0%, transparent 70%);
    pointer-events:none; z-index:0;
  }
  .glass {
    background: var(--surface); border: 1px solid var(--border);
    backdrop-filter: blur(18px); border-radius: 16px;
  }
  .section-divider { border: none; border-top: 1px solid var(--border); margin: 28px 0; }

  .det-table { width: 100%; border-collapse: collapse; min-width: 560px; }
  .det-table thead th {
    padding: 12px 16px;
    font-size: 11px; font-weight: 600; letter-spacing: .7px; text-transform: uppercase;
    color: var(--muted); border-bottom: 1px solid var(--border);
    text-align: left;
  }
  .det-table thead th.right { text-align: right; }
  .det-table tbody tr { border-bottom: 1px solid rgba(255,255,255,.04); }
  .det-table tbody tr:last-child { border-bottom: none; }
  .det-table td { padding: 14px 16px; font-size: 14px; }
  .det-table td.right { text-align: right; }

  .inv-select {
    background: rgba(255,255,255,.05); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    padding: 9px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; cursor: pointer; outline: none;
    transition: border-color .2s;
  }
  .inv-select:focus { border-color: rgba(108,141,255,.5); }
  .inv-select option { background: #1a1d26; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 16px;
    background: rgba(255,255,255,.06); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: background .2s;
  }
  .btn-ghost:hover { background: rgba(255,255,255,.10); }

  .fade-up { opacity:0; transform:translateY(16px); transition: opacity .5s ease, transform .5s ease; }
  .fade-up.show { opacity:1; transform:translateY(0); }
  .delay-1 { transition-delay: .07s; }
  .delay-2 { transition-delay: .14s; }
`

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { if (id) fetchInvoice() }, [id])

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`)
      setInvoice(response.data)
      setTimeout(() => setLoaded(true), 50)
    } catch {
      alert('Erreur lors du chargement de la facture')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!invoice) return
    setUpdating(true)
    try {
      let data: any = { status: newStatus }
      if (newStatus === 'partial') {
        const amount = prompt('Montant payé (TND) ?', invoice.paid_amount?.toString() || '0')
        if (amount === null) { setUpdating(false); return }
        const paid = parseFloat(amount)
        if (isNaN(paid) || paid < 0 || paid > invoice.total) {
          alert('Montant invalide'); setUpdating(false); return
        }
        data.paid_amount = paid
      } else if (newStatus === 'paid') {
        data.paid_amount = invoice.total
      }
      await api.patch(`/invoices/${id}/status`, data)
      fetchInvoice()
    } catch {
      alert('Erreur lors du changement de statut')
    } finally {
      setUpdating(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url; a.setAttribute('download', `facture-${invoice?.invoice_number}.pdf`)
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors du téléchargement')
    }
  }

  if (loading) return <LoadingScreen />
  if (!invoice) return (
    <div style={{ minHeight:'100vh', background:'#0d0f14', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280', fontFamily:'DM Sans,sans-serif' }}>
      Facture non trouvée
    </div>
  )

  const s = STATUS_MAP[invoice.status] ?? STATUS_MAP.draft
  const subtotal = invoice.items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0)
  const taxTotal = invoice.total - subtotal

  return (
    <>
      <style>{STYLES}</style>
      <div className="det-root relative z-10">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* ── Back ── */}
          <button
            className={`btn-ghost mb-8 fade-up ${loaded ? 'show' : ''}`}
            onClick={() => navigate('/invoices')}
          >
            <ArrowLeft size={15} /> Retour aux factures
          </button>

          {/* ── Card ── */}
          <div className={`glass p-8 fade-up delay-1 ${loaded ? 'show' : ''}`}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>
                    {invoice.invoice_number}
                  </h1>
                  <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg }}>
                    {s.label}
                  </span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Émise le {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                  {invoice.due_date && ` · Échéance le ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn-ghost" onClick={handleDownloadPdf}>
                  <Download size={15} /> PDF
                </button>
                <select
                  className="inv-select"
                  value={invoice.status}
                  onChange={e => updateStatus(e.target.value)}
                  disabled={updating}
                >
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyée</option>
                  <option value="paid">Payée</option>
                  <option value="overdue">En retard</option>
                  <option value="partial">Partiellement payée</option>
                </select>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Client */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                Client
              </p>
              <p style={{ fontWeight: 600, fontSize: 16 }}>{invoice.customer_name}</p>
            </div>

            <hr className="section-divider" />

            {/* Articles */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
                Articles
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="det-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="right">Qté</th>
                      <th className="right">P.U HT</th>
                      <th className="right">TVA %</th>
                      <th className="right">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.description}</td>
                        <td className="right" style={{ color: 'var(--muted)' }}>{item.quantity}</td>
                        <td className="right" style={{ color: 'var(--muted)' }}>{item.unit_price.toFixed(2)} TND</td>
                        <td className="right" style={{ color: 'var(--muted)' }}>{item.tax_rate}%</td>
                        <td className="right" style={{ fontWeight: 600 }}>
                          {(item.quantity * item.unit_price * (1 + item.tax_rate / 100)).toFixed(2)} TND
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Totaux */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 280 }}>
                <TotalRow label="Total HT" value={`${subtotal.toFixed(2)} TND`} />
                <TotalRow label="Total TVA" value={`${taxTotal.toFixed(2)} TND`} />
                <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Total TTC</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {invoice.total.toFixed(2)} TND
                  </span>
                </div>
                {invoice.paid_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--muted)' }}>Payé</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>{invoice.paid_amount.toFixed(2)} TND</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <>
                <hr className="section-divider" />
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
                    Notes
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', background: 'rgba(255,255,255,.03)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    {invoice.notes}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function LoadingScreen() {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .loader { width:36px;height:36px;border:3px solid rgba(108,141,255,.2);border-top-color:#6c8dff;border-radius:50%;animation:spin .7s linear infinite; }`}</style>
      <div style={{ minHeight:'100vh',background:'#0d0f14',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div className="loader" />
      </div>
    </>
  )
}

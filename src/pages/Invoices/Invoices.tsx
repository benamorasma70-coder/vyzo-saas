import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Eye, Download, FileText, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  total: number
  paid_amount: number
  status: string
  customer_name: string
  has_pdf: number
}

const SHARED_STYLES = `
  :root {
    --bg:       #0d0f14;
    --surface:  rgba(255,255,255,0.045);
    --border:   rgba(255,255,255,0.08);
    --accent:   #6c8dff;
    --accent2:  #a78bfa;
    --text:     #e8eaf0;
    --muted:    #6b7280;
    --success:  #34d399;
    --danger:   #f87171;
    --warning:  #fbbf24;
  }

  .inv-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding: 40px 24px;
  }
  .inv-root::before {
    content: '';
    position: fixed;
    top: -200px; left: -200px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(108,141,255,.10) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .inv-root::after {
    content: '';
    position: fixed;
    bottom: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(167,139,250,.08) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .glass {
    background: var(--surface);
    border: 1px solid var(--border);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: 16px;
  }

  /* Input / Select */
  .inv-input {
    background: rgba(255,255,255,.05);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .inv-input:focus {
    border-color: rgba(108,141,255,.5);
    box-shadow: 0 0 0 3px rgba(108,141,255,.12);
  }
  .inv-input::placeholder { color: var(--muted); }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: opacity .2s, transform .15s;
  }
  .btn-primary:hover { opacity: .9; transform: translateY(-1px); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    background: rgba(255,255,255,.06);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }
  .btn-ghost:hover { background: rgba(255,255,255,.10); border-color: rgba(255,255,255,.16); }

  /* Table */
  .inv-table { width: 100%; border-collapse: collapse; min-width: 760px; }
  .inv-table thead th {
    padding: 14px 20px;
    font-size: 11px; font-weight: 600;
    letter-spacing: .8px; text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
    text-align: left;
  }
  .inv-table thead th.right { text-align: right; }
  .inv-table thead th.center { text-align: center; }

  .inv-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,.04);
    transition: background .15s;
  }
  .inv-table tbody tr:hover { background: rgba(255,255,255,.04); }

  .inv-table td {
    padding: 14px 20px;
    font-size: 14px;
    color: var(--text);
  }
  .inv-table td.right { text-align: right; }
  .inv-table td.center { text-align: center; }

  /* Status badge */
  .status-pill {
    display: inline-block;
    padding: 3px 11px;
    border-radius: 99px;
    font-size: 11px; font-weight: 600;
    letter-spacing: .3px;
  }

  /* Icon buttons */
  .icon-btn {
    background: none; border: none;
    cursor: pointer; padding: 6px;
    border-radius: 8px;
    transition: background .15s, color .15s;
    color: var(--muted);
    display: inline-flex; align-items: center;
  }
  .icon-btn:hover { background: rgba(255,255,255,.08); color: var(--text); }
  .icon-btn.blue:hover  { color: var(--accent); }
  .icon-btn.green:hover { color: var(--success); }
  .icon-btn.orange:hover { color: var(--warning); }

  .fade-up {
    opacity: 0; transform: translateY(16px);
    transition: opacity .5s ease, transform .5s ease;
  }
  .fade-up.show { opacity: 1; transform: translateY(0); }
  .delay-1 { transition-delay: .05s; }
  .delay-2 { transition-delay: .12s; }
`

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  paid:    { label: 'Payée',     color: '#34d399', bg: 'rgba(52,211,153,.12)'  },
  overdue: { label: 'En retard', color: '#f87171', bg: 'rgba(248,113,113,.12)' },
  partial: { label: 'Partiel',   color: '#fbbf24', bg: 'rgba(251,191,36,.12)'  },
  sent:    { label: 'Envoyée',   color: '#6c8dff', bg: 'rgba(108,141,255,.12)' },
  draft:   { label: 'Brouillon', color: '#9ca3af', bg: 'rgba(156,163,175,.12)' },
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [exporting, setExporting] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices')
      setInvoices(response.data)
      setTimeout(() => setLoaded(true), 50)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePdf = async (id: string) => {
    setGeneratingPdf(id)
    try {
      const response = await api.post(`/invoices/${id}/generate-pdf`)
      window.open(response.data.pdf_url, '_blank')
      fetchInvoices()
    } catch {
      alert('Erreur lors de la génération du PDF')
    } finally {
      setGeneratingPdf(null)
    }
  }

  const handleDownloadPDF = async (id: string, number: string) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `facture-${number}.pdf`)
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors du téléchargement')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await api.get('/invoices/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', 'factures.csv')
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert("Erreur lors de l'export")
    } finally {
      setExporting(false)
    }
  }

  const filtered = invoices.filter(i =>
    i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingScreen />

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="inv-root relative z-10">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div className={`flex flex-wrap justify-between items-center gap-4 mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px' }}>
                Factures
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
                {filtered.length} facture{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  className="inv-input"
                  style={{ paddingLeft: 36, width: 240 }}
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="btn-ghost" onClick={handleExport} disabled={exporting}>
                {exporting ? 'Export...' : 'Exporter CSV'}
              </button>
              <button className="btn-primary" onClick={() => navigate('/invoices/new')}>
                <Plus size={16} /> Nouvelle Facture
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className={`glass fade-up delay-1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Client</th>
                    <th>Émission</th>
                    <th className="right">Total</th>
                    <th className="center">Statut</th>
                    <th className="center">PDF</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
                        Aucune facture trouvée
                      </td>
                    </tr>
                  )}
                  {filtered.map((invoice) => {
                    const s = STATUS_MAP[invoice.status] ?? STATUS_MAP.draft
                    return (
                      <tr key={invoice.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', background: 'rgba(108,141,255,.1)', padding: '3px 8px', borderRadius: 6 }}>
                            {invoice.invoice_number}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{invoice.customer_name}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                          {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="right">
                          <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 15 }}>
                            {invoice.total.toLocaleString()} TND
                          </div>
                          {invoice.paid_amount > 0 && (
                            <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 2 }}>
                              Payé : {invoice.paid_amount.toLocaleString()} TND
                            </div>
                          )}
                        </td>
                        <td className="center">
                          <span className="status-pill" style={{ color: s.color, background: s.bg }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="center">
                          <FileText size={16} style={{ color: invoice.has_pdf ? 'var(--success)' : 'var(--border)' }} />
                        </td>
                        <td className="right">
                          <button className="icon-btn blue" title="Voir" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                            <Eye size={16} />
                          </button>
                          {invoice.has_pdf ? (
                            <button className="icon-btn green" title="Télécharger PDF" onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}>
                              <Download size={16} />
                            </button>
                          ) : (
                            <button className="icon-btn orange" title="Générer PDF" onClick={() => handleGeneratePdf(invoice.id)} disabled={generatingPdf === invoice.id}>
                              {generatingPdf === invoice.id
                                ? <RefreshCw size={16} style={{ animation: 'spin .7s linear infinite' }} />
                                : <FileText size={16} />}
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .loader { width:36px;height:36px;border:3px solid rgba(108,141,255,.2);border-top-color:#6c8dff;border-radius:50%;animation:spin .7s linear infinite; }`}</style>
      <div style={{ minHeight:'100vh',background:'#0d0f14',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div className="loader" />
      </div>
    </>
  )
}

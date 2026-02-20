import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'

interface Customer { id: string; company_name: string; contact_name: string }
interface Product  { id: string; name: string; sale_price: number; tax_rate: number; unit: string }
interface InvoiceItem {
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

const STYLES = `
  :root {
    --bg: #0d0f14; --surface: rgba(255,255,255,0.045);
    --border: rgba(255,255,255,0.08); --accent: #6c8dff;
    --accent2: #a78bfa; --text: #e8eaf0; --muted: #6b7280;
    --danger: #f87171;
  }
  .form-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg); min-height: 100vh;
    color: var(--text); padding: 40px 24px;
  }
  .form-root::before {
    content:''; position:fixed; top:-200px; left:-200px;
    width:700px; height:700px;
    background: radial-gradient(circle, rgba(108,141,255,.10) 0%, transparent 70%);
    pointer-events:none; z-index:0;
  }
  .glass {
    background: var(--surface); border: 1px solid var(--border);
    backdrop-filter: blur(18px); border-radius: 16px;
  }

  /* Field label */
  .field-label {
    display: block;
    font-size: 11px; font-weight: 600; letter-spacing: .7px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 8px;
  }

  /* Input / Select / Textarea */
  .f-input {
    width: 100%;
    background: rgba(255,255,255,.05);
    border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color .2s, box-shadow .2s;
    box-sizing: border-box;
  }
  .f-input:focus {
    border-color: rgba(108,141,255,.5);
    box-shadow: 0 0 0 3px rgba(108,141,255,.12);
  }
  .f-input::placeholder { color: var(--muted); }
  .f-input option { background: #1a1d26; }

  /* Table */
  .item-table { width: 100%; border-collapse: collapse; min-width: 640px; }
  .item-table thead th {
    padding: 10px 12px;
    font-size: 11px; font-weight: 600; letter-spacing: .7px; text-transform: uppercase;
    color: var(--muted); border-bottom: 1px solid var(--border); text-align: left;
  }
  .item-table thead th.right { text-align: right; }
  .item-table tbody tr { border-bottom: 1px solid rgba(255,255,255,.04); }
  .item-table tbody tr:last-child { border-bottom: none; }
  .item-table td { padding: 10px 12px; vertical-align: middle; }

  /* Small input inside table */
  .cell-input {
    background: rgba(255,255,255,.05); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text);
    padding: 7px 10px; font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; transition: border-color .2s;
    width: 100%;
  }
  .cell-input:focus { border-color: rgba(108,141,255,.45); }
  .cell-input option { background: #1a1d26; }
  .cell-input.right { text-align: right; }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: opacity .2s, transform .15s;
  }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
  .btn-primary:not(:disabled):hover { opacity: .9; transform: translateY(-1px); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px;
    background: rgba(255,255,255,.06); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background .2s;
  }
  .btn-ghost:hover { background: rgba(255,255,255,.10); }

  .btn-add {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(108,141,255,.12); border: 1px solid rgba(108,141,255,.3);
    border-radius: 8px; color: var(--accent);
    padding: 7px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: background .2s;
  }
  .btn-add:hover { background: rgba(108,141,255,.2); }

  .btn-del {
    background: none; border: none; cursor: pointer; padding: 6px;
    border-radius: 8px; color: var(--muted);
    transition: background .15s, color .15s;
    display: inline-flex; align-items: center;
  }
  .btn-del:hover { background: rgba(248,113,113,.12); color: var(--danger); }

  .section-divider { border: none; border-top: 1px solid var(--border); margin: 28px 0; }

  .fade-up { opacity:0; transform:translateY(16px); transition: opacity .5s ease, transform .5s ease; }
  .fade-up.show { opacity:1; transform:translateY(0); }
  .delay-1 { transition-delay: .07s; }
  .delay-2 { transition-delay: .14s; }
`

export function InvoiceForm() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts]   = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 19 }
  ])
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate]   = useState('')
  const [notes, setNotes]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [loaded, setLoaded]     = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/customers').then(r => setCustomers(r.data)),
      api.get('/products').then(r => setProducts(r.data)),
    ]).then(() => setTimeout(() => setLoaded(true), 50))
      .catch(console.error)
  }, [])

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 19 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const next = [...items]
    next[index] = { ...next[index], [field]: value }
    setItems(next)
  }

  const handleProductSelect = (index: number, productId: string) => {
    if (!productId) return
    const product = products.find(p => String(p.id) === productId)
    if (product) {
      const next = [...items]
      next[index] = { ...next[index], productId: product.id, description: product.name, unitPrice: product.sale_price, taxRate: product.tax_rate }
      setItems(next)
    }
  }

  const totals = (() => {
    let subtotal = 0, taxTotal = 0
    items.forEach(item => {
      const base = item.quantity * item.unitPrice
      subtotal += base
      taxTotal += base * (item.taxRate / 100)
    })
    return { subtotal, taxTotal, total: subtotal + taxTotal }
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/invoices', { customerId, items, issueDate, dueDate, notes })
      navigate('/invoices')
    } catch {
      alert('Erreur lors de la création de la facture')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="form-root relative z-10">
        <div style={{ maxWidth: 920, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div className={`mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <button className="btn-ghost mb-6" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => navigate('/invoices')}>
              <ArrowLeft size={14} /> Retour
            </button>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px' }}>
              Nouvelle{' '}
              <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Facture
              </span>
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ── Section : Client & dates ── */}
            <div className={`glass p-8 mb-5 fade-up delay-1 ${loaded ? 'show' : ''}`}>
              <SectionTitle>Informations générales</SectionTitle>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="field-label">Client</label>
                  <select className="f-input" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                    <option value="">Sélectionner un client</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name || c.contact_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Date d'émission</label>
                    <input type="date" className="f-input" value={issueDate} onChange={e => setIssueDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="field-label">Date d'échéance</label>
                    <input type="date" className="f-input" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section : Articles ── */}
            <div className={`glass p-8 mb-5 fade-up delay-2 ${loaded ? 'show' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionTitle>Articles</SectionTitle>
                <button type="button" className="btn-add" onClick={addItem}>
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: 20 }}>
                <table className="item-table">
                  <thead>
                    <tr>
                      <th>Produit / Description</th>
                      <th className="right" style={{ width: 80 }}>Qté</th>
                      <th className="right" style={{ width: 110 }}>P.U HT</th>
                      <th className="right" style={{ width: 90 }}>TVA %</th>
                      <th className="right" style={{ width: 120 }}>Total TTC</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const lineTotal = item.quantity * item.unitPrice * (1 + item.taxRate / 100)
                      return (
                        <tr key={index}>
                          {/* Description */}
                          <td>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <select
                                className="cell-input"
                                style={{ flex: '0 0 140px' }}
                                value={item.productId || ''}
                                onChange={e => handleProductSelect(index, e.target.value)}
                              >
                                <option value="">Manuel</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                className="cell-input"
                                style={{ flex: 1 }}
                                value={item.description}
                                onChange={e => updateItem(index, 'description', e.target.value)}
                                placeholder="Description"
                                required
                              />
                            </div>
                          </td>
                          <td>
                            <input type="number" className="cell-input right" value={item.quantity}
                              onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))} min="1" required />
                          </td>
                          <td>
                            <input type="number" className="cell-input right" value={item.unitPrice}
                              onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value))} min="0" step="0.01" required />
                          </td>
                          <td>
                            <input type="number" className="cell-input right" value={item.taxRate}
                              onChange={e => updateItem(index, 'taxRate', parseFloat(e.target.value))} min="0" max="100" step="0.01" />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
                            {lineTotal.toFixed(2)} TND
                          </td>
                          <td>
                            {items.length > 1 && (
                              <button type="button" className="btn-del" onClick={() => removeItem(index)}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <div style={{ width: 280 }}>
                  <TotalRow label="Total HT"  value={`${totals.subtotal.toFixed(2)} TND`} />
                  <TotalRow label="Total TVA" value={`${totals.taxTotal.toFixed(2)} TND`} />
                  <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Total TTC</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {totals.total.toFixed(2)} TND
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <hr className="section-divider" />
              <div>
                <label className="field-label">Notes</label>
                <textarea
                  className="f-input"
                  style={{ height: 96, resize: 'vertical' }}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Conditions de paiement, notes particulières..."
                />
              </div>
            </div>

            {/* ── Actions ── */}
            <div className={`flex justify-end gap-3 fade-up delay-2 ${loaded ? 'show' : ''}`}>
              <button type="button" className="btn-ghost" onClick={() => navigate('/invoices')}>
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Création...' : 'Créer la facture'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontWeight: 600, fontSize: 15, letterSpacing: '.2px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(to bottom, var(--accent), var(--accent2))', display: 'inline-block' }} />
      {children}
    </h2>
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

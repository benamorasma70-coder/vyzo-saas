import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { BASE_STYLES } from './shared-styles'

interface Customer { id: string; company_name: string; contact_name: string }
interface Product  { id: string; name: string; sale_price: number; tax_rate: number; unit: string }
interface QuoteItem { productId?: string; description: string; quantity: number; unitPrice: number; taxRate: number }

export function QuoteForm() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts]   = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<QuoteItem[]>([{ description: '', quantity: 1, unitPrice: 0, taxRate: 19 }])
  const [issueDate, setIssueDate]   = useState(new Date().toISOString().split('T')[0])
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [loaded, setLoaded]         = useState(false)

  useEffect(() => {
    Promise.all([api.get('/customers').then(r => setCustomers(r.data)), api.get('/products').then(r => setProducts(r.data))])
      .then(() => setTimeout(() => setLoaded(true), 50)).catch(console.error)
  }, [])

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 19 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const next = [...items]; next[index] = { ...next[index], [field]: value }; setItems(next)
  }
  const handleProductSelect = (index: number, productId: string) => {
    if (!productId) return
    const p = products.find(p => String(p.id) === productId)
    if (p) { const next = [...items]; next[index] = { ...next[index], productId: p.id, description: p.name, unitPrice: p.sale_price, taxRate: p.tax_rate }; setItems(next) }
  }
  const totals = (() => {
    let sub = 0, tax = 0; items.forEach(i => { const b = i.quantity * i.unitPrice; sub += b; tax += b * (i.taxRate / 100) }); return { sub, tax, total: sub + tax }
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await api.post('/quotes', { customerId, items, issueDate, expiryDate, notes }); navigate('/quotes') }
    catch { alert('Erreur lors de la création du devis') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div className={`mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <button className="btn-ghost mb-6" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => navigate('/quotes')}><ArrowLeft size={14} /> Retour</button>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700 }}>
              Nouveau <span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Devis</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={`glass p-8 mb-5 fade-up d1 ${loaded ? 'show' : ''}`}>
              <SectionTitle>Informations générales</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="field-label">Client</label>
                  <select className="f-input" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                    <option value="">Sélectionner un client</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.company_name || c.contact_name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="field-label">Date d'émission</label><input type="date" className="f-input" value={issueDate} onChange={e => setIssueDate(e.target.value)} required /></div>
                  <div><label className="field-label">Date d'expiration</label><input type="date" className="f-input" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
                </div>
              </div>
            </div>

            <div className={`glass p-8 mb-5 fade-up d2 ${loaded ? 'show' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionTitle>Articles</SectionTitle>
                <button type="button" className="btn-add" onClick={addItem}><Plus size={14} /> Ajouter</button>
              </div>
              <div style={{ overflowX: 'auto', marginTop: 20 }}>
                <table className="item-table">
                  <thead><tr>
                    <th>Produit / Description</th><th className="right" style={{ width: 80 }}>Qté</th>
                    <th className="right" style={{ width: 110 }}>P.U HT</th><th className="right" style={{ width: 90 }}>TVA %</th>
                    <th className="right" style={{ width: 120 }}>Total TTC</th><th style={{ width: 40 }}></th>
                  </tr></thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <select className="cell-input" style={{ flex: '0 0 140px' }} value={item.productId || ''} onChange={e => handleProductSelect(index, e.target.value)}>
                              <option value="">Manuel</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                            </select>
                            <input type="text" className="cell-input" style={{ flex: 1 }} value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Description" required />
                          </div>
                        </td>
                        <td><input type="number" className="cell-input right" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))} min="1" required /></td>
                        <td><input type="number" className="cell-input right" value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value))} min="0" step="0.01" required /></td>
                        <td><input type="number" className="cell-input right" value={item.taxRate} onChange={e => updateItem(index, 'taxRate', parseFloat(e.target.value))} min="0" max="100" step="0.01" /></td>
                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 14 }}>{(item.quantity * item.unitPrice * (1 + item.taxRate / 100)).toFixed(2)} DZD</td>
                        <td>{items.length > 1 && <button type="button" className="btn-del" onClick={() => removeItem(index)}><Trash2 size={15} /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <div style={{ width: 280 }}>
                  <TotalRow label="Total HT" value={`${totals.sub.toFixed(2)} DZD`} />
                  <TotalRow label="Total TVA" value={`${totals.tax.toFixed(2)} DZD`} />
                  <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Total TTC</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{totals.total.toFixed(2)} DZD</span>
                  </div>
                </div>
              </div>

              <hr className="divider" />
              <label className="field-label">Notes</label>
              <textarea className="f-input" style={{ height: 96, resize: 'vertical', marginTop: 8 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Conditions, notes particulières..." />
            </div>

            <div className={`flex justify-end gap-3 fade-up d2 ${loaded ? 'show' : ''}`}>
              <button type="button" className="btn-ghost" onClick={() => navigate('/quotes')}>Annuler</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Création...' : 'Créer le devis'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(to bottom,var(--accent),var(--accent2))', display: 'inline-block' }} />
    {children}
  </h2>
)
const TotalRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
    <span style={{ color: 'var(--muted)' }}>{label}</span><span>{value}</span>
  </div>
)

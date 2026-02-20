import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { BASE_STYLES } from '../../shared-styles'

interface Customer { id: string; company_name: string; contact_name: string }
interface Product  { id: string; name: string; sale_price: number; tax_rate: number; unit: string }
interface DeliveryItem { productId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }

const ST = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(to bottom,var(--accent),var(--accent2))', display: 'inline-block' }} />
    {children}
  </h2>
)

export function DeliveryForm() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts]   = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<DeliveryItem[]>([{ description: '', quantity: 1, unitPrice: 0 }])
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    Promise.all([api.get('/customers').then(r => setCustomers(r.data)), api.get('/products').then(r => setProducts(r.data))])
      .then(() => setTimeout(() => setLoaded(true), 50)).catch(console.error)
  }, [])

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (index: number, field: keyof DeliveryItem, value: any) => {
    const next = [...items]; next[index] = { ...next[index], [field]: value }; setItems(next)
  }
  const handleProductSelect = (index: number, productId: string) => {
    if (!productId) return
    const p = products.find(p => String(p.id) === productId)
    if (p) { const next = [...items]; next[index] = { ...next[index], productId: p.id, description: p.name, unitPrice: p.sale_price, taxRate: p.tax_rate }; setItems(next) }
  }
  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await api.post('/deliveries', { customerId, items, deliveryDate, notes }); navigate('/deliveries') }
    catch { alert('Erreur lors de la création du bon de livraison') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div className={`mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <button className="btn-ghost mb-6" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => navigate('/deliveries')}><ArrowLeft size={14} /> Retour</button>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700 }}>
              Nouveau <span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bon de Livraison</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={`glass p-8 mb-5 fade-up d1 ${loaded ? 'show' : ''}`}>
              <ST>Informations générales</ST>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="field-label">Client</label>
                  <select className="f-input" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                    <option value="">Sélectionner un client</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.company_name || c.contact_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Date de livraison</label>
                  <input type="date" className="f-input" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className={`glass p-8 mb-5 fade-up d2 ${loaded ? 'show' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ST>Articles</ST>
                <button type="button" className="btn-add" onClick={addItem}><Plus size={14} /> Ajouter</button>
              </div>
              <div style={{ overflowX: 'auto', marginTop: 20 }}>
                <table className="item-table">
                  <thead><tr>
                    <th>Produit / Description</th><th className="right" style={{ width: 80 }}>Qté</th>
                    <th className="right" style={{ width: 110 }}>P.U HT</th><th className="right" style={{ width: 120 }}>Total</th><th style={{ width: 40 }}></th>
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
                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 14 }}>{(item.quantity * item.unitPrice).toFixed(2)} DZD</td>
                        <td>{items.length > 1 && <button type="button" className="btn-del" onClick={() => removeItem(index)}><Trash2 size={15} /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <div style={{ width: 280 }}>
                  <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Total TTC</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{total.toFixed(2)} DZD</span>
                  </div>
                </div>
              </div>

              <hr className="divider" />
              <label className="field-label">Notes</label>
              <textarea className="f-input" style={{ height: 96, resize: 'vertical', marginTop: 8 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes particulières..." />
            </div>

            <div className={`flex justify-end gap-3 fade-up d2 ${loaded ? 'show' : ''}`}>
              <button type="button" className="btn-ghost" onClick={() => navigate('/deliveries')}>Annuler</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Création...' : 'Créer le BL'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

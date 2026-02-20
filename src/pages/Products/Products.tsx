// ═══════════════ Products.tsx ═══════════════
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { BASE_STYLES } from './shared-styles'
import { ProductModal } from './ProductModal'

interface Product { id: string; reference: string; name: string; category: string; sale_price: number; stock_quantity: number; min_stock: number; unit: string }

export function Products() {
  const [products, setProducts]     = useState<Product[]>([])
  const [loading, setLoading]       = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen]     = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try { const r = await api.get('/products'); setProducts(r.data); setTimeout(() => setLoaded(true), 50) }
    catch { console.error('Error fetching products') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    try { await api.delete(`/products/${id}`); fetchProducts() }
    catch { alert('Erreur lors de la suppression') }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loader />

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div className={`flex flex-wrap justify-between items-center gap-4 mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700 }}>Produits</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input className="f-input" style={{ paddingLeft: 36, width: 240 }} placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => { setSelectedProduct(null); setIsModalOpen(true) }}><Plus size={16} /> Nouveau Produit</button>
            </div>
          </div>

          <div className={`glass fade-up d1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr>
                  <th>Référence</th><th>Nom</th><th>Catégorie</th>
                  <th className="right">Prix HT</th><th className="right">Stock</th><th className="right">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>Aucun produit trouvé</td></tr>}
                  {filtered.map(p => {
                    const lowStock = p.stock_quantity <= p.min_stock && p.min_stock > 0
                    return (
                      <tr key={p.id}>
                        <td><span className="ref-badge">{p.reference}</span></td>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{p.category || '-'}</td>
                        <td className="right" style={{ fontWeight: 600 }}>{p.sale_price.toLocaleString()} TND</td>
                        <td className="right">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            <span style={{ fontWeight: 600, color: lowStock ? 'var(--danger)' : 'var(--text)' }}>{p.stock_quantity} {p.unit}</span>
                            {lowStock && <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />}
                          </div>
                        </td>
                        <td className="right">
                          <button className="icon-btn blue" onClick={() => { setSelectedProduct(p); setIsModalOpen(true) }}><Edit2 size={16} /></button>
                          <button className="icon-btn red" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
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
      {isModalOpen && <ProductModal product={selectedProduct as any} onClose={() => setIsModalOpen(false)} onSave={fetchProducts} />}
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

import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { ProductModal } from './ProductModal'
import { SHARED_STYLES } from '../../shared-styles'

interface Product {
  id: string
  reference: string
  name: string
  category: string
  sale_price: number
  stock_quantity: number
  min_stock: number
  unit: string
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
      setTimeout(() => setLoaded(true), 50)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return
    try {
      await api.delete(`/products/${id}`)
      fetchProducts()
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}>Produits</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{filteredProducts.length} produits</p>
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
              <button className="btn-primary" onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}>
                <Plus size={16} /> Nouveau Produit
              </button>
            </div>
          </div>

          {/* Tableau */}
          <div className={`glass fade-up delay-1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th className="right">Prix</th>
                    <th className="right">Stock</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>Aucun produit trouvé</td></tr>
                  )}
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', background: 'rgba(108,141,255,.1)', padding: '3px 8px', borderRadius: 6 }}>
                          {product.reference}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{product.category || '-'}</td>
                      <td className="right" style={{ fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 15 }}>
                        {product.sale_price.toLocaleString()} DZD
                      </td>
                      <td className="right">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <span style={{ color: product.stock_quantity <= product.min_stock && product.min_stock > 0 ? 'var(--danger)' : 'inherit' }}>
                            {product.stock_quantity} {product.unit}
                          </span>
                          {product.stock_quantity <= product.min_stock && product.min_stock > 0 && (
                            <AlertTriangle size={16} style={{ color: 'var(--warning)', marginLeft: 6 }} />
                          )}
                        </div>
                      </td>
                      <td className="right">
                        <button className="icon-btn blue" onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn red" onClick={() => handleDelete(product.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          product={selectedProduct as any}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchProducts}
        />
      )}
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

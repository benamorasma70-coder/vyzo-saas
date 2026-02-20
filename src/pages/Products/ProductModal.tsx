import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { X } from 'lucide-react'
import { SHARED_STYLES } from '../../shared-styles'

interface Product {
  id?: string
  reference: string
  name: string
  description?: string
  category?: string
  unit: string
  purchasePrice?: number
  salePrice: number
  taxRate: number
  stockQuantity: number
  minStock: number
}

interface Props {
  product: Product | null
  onClose: () => void
  onSave: () => void
}

export function ProductModal({ product, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Product>({
    reference: '',
    name: '',
    description: '',
    category: '',
    unit: 'unité',
    purchasePrice: 0,
    salePrice: 0,
    taxRate: 19,
    stockQuantity: 0,
    minStock: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        reference: product.reference || '',
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        unit: product.unit || 'unité',
        purchasePrice: (product as any).purchase_price || 0,
        salePrice: (product as any).sale_price || 0,
        taxRate: (product as any).tax_rate || 19,
        stockQuantity: (product as any).stock_quantity || 0,
        minStock: (product as any).min_stock || 0,
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (product?.id) {
        await api.put(`/products/${product.id}`, formData)
      } else {
        await api.post('/products', formData)
      }
      onSave()
      onClose()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Référence *</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className="input"
                    required
                    disabled={!!product}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Nom *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Catégorie</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Unité</label>
                  <select name="unit" value={formData.unit} onChange={handleChange} className="input">
                    <option value="unité">Unité</option>
                    <option value="kg">Kg</option>
                    <option value="litre">Litre</option>
                    <option value="mètre">Mètre</option>
                    <option value="heure">Heure</option>
                    <option value="forfait">Forfait</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Prix d'achat (HT)</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Prix de vente (HT) *</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Taux TVA (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Stock initial</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    disabled={!!product}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Stock minimum</label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleChange}
                    className="input"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-ghost">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { X } from 'lucide-react'
import { BASE_STYLES } from '../../shared-styles'

interface Product {
  id?: string; reference: string; name: string; description?: string; category?: string
  unit: string; purchasePrice?: number; salePrice: number; taxRate: number
  stockQuantity: number; minStock: number
}
interface Props { product: Product | null; onClose: () => void; onSave: () => void }

const MODAL_EXTRA = `
  .modal-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,.65);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .modal-card {
    background: #13161f;
    border: 1px solid rgba(255,255,255,.10);
    border-radius: 20px;
    width: 100%; max-width: 680px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 32px 80px rgba(0,0,0,.6);
  }
  .modal-card::-webkit-scrollbar { width: 6px; }
  .modal-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }
`

export function ProductModal({ product, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Product>({ reference: '', name: '', description: '', category: '', unit: 'unité', purchasePrice: 0, salePrice: 0, taxRate: 19, stockQuantity: 0, minStock: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) setFormData({
      reference: product.reference || '', name: product.name || '', description: product.description || '',
      category: product.category || '', unit: product.unit || 'unité',
      purchasePrice: (product as any).purchase_price || 0, salePrice: (product as any).sale_price || 0,
      taxRate: (product as any).tax_rate || 19, stockQuantity: (product as any).stock_quantity || 0,
      minStock: (product as any).min_stock || 0,
    })
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (product?.id) await api.put(`/products/${product.id}`, formData)
      else await api.post('/products', formData)
      onSave(); onClose()
    } catch (error: any) { alert(error.response?.data?.error || 'Erreur lors de la sauvegarde') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const F = ({ label, name, type = 'text', required = false, disabled = false, min, max, step, span2 = false }: any) => (
    <div className={span2 ? 'col-span-1 md:col-span-2' : ''}>
      <label className="field-label">{label}{required ? ' *' : ''}</label>
      <input type={type} name={name} value={(formData as any)[name] ?? ''} onChange={handleChange}
        className="f-input" required={required} disabled={disabled} min={min} max={max} step={step} />
    </div>
  )

  return (
    <>
      <style>{BASE_STYLES + MODAL_EXTRA}</style>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-card">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>
              {product ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', padding: 6, display: 'flex', transition: 'background .2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}>
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <F label="Référence" name="reference" required disabled={!!product} />
              <F label="Nom" name="name" required />
              <F label="Description" name="description" span2 />
              <F label="Catégorie" name="category" />
              <div>
                <label className="field-label">Unité</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="f-input">
                  <option value="unité">Unité</option><option value="kg">Kg</option>
                  <option value="litre">Litre</option><option value="mètre">Mètre</option>
                  <option value="heure">Heure</option><option value="forfait">Forfait</option>
                </select>
              </div>
              <F label="Prix d'achat (HT)" name="purchasePrice" type="number" min={0} step="0.01" />
              <F label="Prix de vente (HT)" name="salePrice" type="number" required min={0} step="0.01" />
              <F label="Taux TVA (%)" name="taxRate" type="number" min={0} max={100} step="0.01" />
              <F label="Stock initial" name="stockQuantity" type="number" min={0} disabled={!!product} />
              <F label="Stock minimum (alerte)" name="minStock" type="number" min={0} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 24, marginTop: 24, borderTop: '1px solid rgba(255,255,255,.08)' }}>
              <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}


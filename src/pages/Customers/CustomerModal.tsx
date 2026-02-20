import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { X } from 'lucide-react'
import { BASE_STYLES } from './shared-styles'

interface Customer { id?: string; companyName?: string; contactName: string; email?: string; phone?: string; address?: string; city?: string; rcNumber?: string; nif?: string; nis?: string; ai?: string }
interface Props { customer: Customer | null; onClose: () => void; onSave: () => void }

const MODAL_EXTRA = `
  .modal-overlay { position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px; }
  .modal-card { background:#13161f;border:1px solid rgba(255,255,255,.10);border-radius:20px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.6); }
  .modal-card::-webkit-scrollbar { width:6px; }
  .modal-card::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1);border-radius:3px; }
`

export function CustomerModal({ customer, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Customer>({ contactName: '', companyName: '', email: '', phone: '', address: '', city: '', rcNumber: '', nif: '', nis: '', ai: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer) setFormData({
      contactName: (customer as any).contact_name || '', companyName: (customer as any).company_name || '',
      email: customer.email || '', phone: customer.phone || '',
      address: (customer as any).address || '', city: (customer as any).city || '',
      rcNumber: (customer as any).rc_number || '', nif: (customer as any).nif || '',
      nis: (customer as any).nis || '', ai: (customer as any).ai || '',
    })
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (customer?.id) await api.put(`/customers/${customer.id}`, formData)
      else await api.post('/customers', formData)
      onSave(); onClose()
    } catch { alert('Erreur lors de la sauvegarde') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const F = ({ label, name, type = 'text', required = false, span2 = false }: any) => (
    <div className={span2 ? 'col-span-1 md:col-span-2' : ''}>
      <label className="field-label">{label}{required ? ' *' : ''}</label>
      <input type={type} name={name} value={(formData as any)[name] ?? ''} onChange={handleChange} className="f-input" required={required} />
    </div>
  )

  return (
    <>
      <style>{BASE_STYLES + MODAL_EXTRA}</style>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>
              {customer ? 'Modifier le client' : 'Nouveau client'}
            </h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', padding: 6, display: 'flex', transition: 'background .2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <F label="Nom du contact" name="contactName" required span2 />
              <F label="Nom de l'entreprise" name="companyName" span2 />
              <F label="Email" name="email" type="email" />
              <F label="Téléphone" name="phone" type="tel" />
              <F label="Adresse" name="address" span2 />
              <F label="Ville" name="city" />
              <F label="N° RC" name="rcNumber" />
              <F label="NIF" name="nif" />
              <F label="NIS" name="nis" />
              <F label="AI" name="ai" />
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

// ═══════════════ Customers.tsx ═══════════════
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react'
import { BASE_STYLES } from './shared-styles'
import { CustomerModal } from './CustomerModal'

interface Customer { id: string; company_name: string; contact_name: string; email: string; phone: string; city: string; nif: string }

export function Customers() {
  const [customers, setCustomers]   = useState<Customer[]>([])
  const [loading, setLoading]       = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen]       = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    try { const r = await api.get('/customers'); setCustomers(r.data); setTimeout(() => setLoaded(true), 50) }
    catch { console.error('Error fetching customers') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return
    try { await api.delete(`/customers/${id}`); fetchCustomers() }
    catch { alert('Impossible de supprimer ce client (des factures existent probablement)') }
  }

  const filtered = customers.filter(c =>
    c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loader />

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div className={`flex flex-wrap justify-between items-center gap-4 mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700 }}>Clients</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{filtered.length} client{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input className="f-input" style={{ paddingLeft: 36, width: 240 }} placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => { setSelectedCustomer(null); setIsModalOpen(true) }}><Plus size={16} /> Nouveau Client</button>
            </div>
          </div>

          <div className={`glass fade-up d1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Client</th><th>Contact</th><th>Ville</th><th>NIF</th><th className="right">Actions</th></tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>Aucun client trouvé</td></tr>}
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.company_name || c.contact_name}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
                            <Mail size={12} style={{ flexShrink: 0 }} /><span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '-'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
                            <Phone size={12} style={{ flexShrink: 0 }} /><span>{c.phone || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{c.city || '-'}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{c.nif || '-'}</td>
                      <td className="right">
                        <button className="icon-btn blue" onClick={() => { setSelectedCustomer(c); setIsModalOpen(true) }}><Edit2 size={16} /></button>
                        <button className="icon-btn red" onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && <CustomerModal customer={selectedCustomer as any} onClose={() => setIsModalOpen(false)} onSave={fetchCustomers} />}
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

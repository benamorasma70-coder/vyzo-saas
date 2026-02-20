import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react'
import { CustomerModal } from './CustomerModal'
import { SHARED_STYLES } from '../../shared-styles'

interface Customer {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  city: string
  nif: string
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers')
      setCustomers(response.data)
      setTimeout(() => setLoaded(true), 50)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return
    try {
      await api.delete(`/customers/${id}`)
      fetchCustomers()
    } catch (error) {
      alert('Impossible de supprimer ce client (des factures existent probablement)')
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingScreen />

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={`fade-up ${loaded ? 'show' : ''}`} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}>Clients</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{filteredCustomers.length} clients</p>
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
              <button className="btn-primary" onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }}>
                <Plus size={16} /> Nouveau Client
              </button>
            </div>
          </div>

          <div className={`glass fade-up delay-1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Ville</th>
                    <th>NIF</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>Aucun client trouvé</td></tr>
                  )}
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td style={{ fontWeight: 500 }}>{customer.company_name || customer.contact_name}</td>
                      <td>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                          {customer.email && (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                              <Mail size={12} style={{ marginRight: 6 }} /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Phone size={12} style={{ marginRight: 6 }} /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{customer.city || '-'}</td>
                      <td style={{ color: 'var(--muted)' }}>{customer.nif || '-'}</td>
                      <td className="right">
                        <button className="icon-btn blue" onClick={() => { setSelectedCustomer(customer); setIsModalOpen(true); }}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn red" onClick={() => handleDelete(customer.id)}>
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
        <CustomerModal
          customer={selectedCustomer as any}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchCustomers}
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

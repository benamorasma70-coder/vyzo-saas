// ═══════════════ AdminDashboard.tsx ═══════════════
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Check, X, RefreshCw } from 'lucide-react'
import { BASE_STYLES } from './shared-styles'

interface SubscriptionRequest { id: number; user_id: number; plan_name: string; display_name: string; status: string; requested_at: string; email: string; company_name: string }

export function AdminDashboard() {
  const [requests, setRequests]       = useState<SubscriptionRequest[]>([])
  const [loading, setLoading]         = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [loaded, setLoaded]           = useState(false)

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    try { const r = await api.get('/admin/subscription-requests'); setRequests(r.data); setTimeout(() => setLoaded(true), 50) }
    catch { alert('Erreur lors du chargement des demandes') }
    finally { setLoading(false) }
  }

  const handleApprove = async (id: number) => {
    if (!confirm('Approuver cette demande ?')) return; setProcessingId(id)
    try { await api.post(`/admin/subscription-requests/${id}/approve`); await fetchRequests() }
    catch { alert("Erreur lors de l'approbation") }
    finally { setProcessingId(null) }
  }

  const handleReject = async (id: number) => {
    if (!confirm('Rejeter cette demande ?')) return; setProcessingId(id)
    try { await api.post(`/admin/subscription-requests/${id}/reject`); await fetchRequests() }
    catch { alert('Erreur lors du rejet') }
    finally { setProcessingId(null) }
  }

  if (loading) return <Loader />

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className={`mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700 }}>
              Gestion des <span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>abonnements</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{requests.length} demande{requests.length !== 1 ? 's' : ''} en attente</p>
          </div>

          {requests.length === 0 ? (
            <div className={`glass p-12 text-center fade-up d1 ${loaded ? 'show' : ''}`}>
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>Aucune demande en attente ✓</p>
            </div>
          ) : (
            <div className={`glass fade-up d1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr>
                    <th>Utilisateur</th><th>Email</th><th>Plan</th>
                    <th>Date demande</th><th className="right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 600 }}>{req.company_name || 'N/A'}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{req.email}</td>
                        <td>
                          <span className="status-pill" style={{ color: '#6c8dff', background: 'rgba(108,141,255,.12)' }}>{req.display_name}</span>
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(req.requested_at).toLocaleDateString('fr-FR')}</td>
                        <td className="right">
                          <button className="icon-btn green" title="Approuver" onClick={() => handleApprove(req.id)} disabled={processingId === req.id}>
                            {processingId === req.id ? <RefreshCw size={16} style={{ animation: 'spin .7s linear infinite' }} /> : <Check size={16} />}
                          </button>
                          <button className="icon-btn red" title="Rejeter" onClick={() => handleReject(req.id)} disabled={processingId === req.id}>
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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


// ═══════════════ SubscriptionRequests.tsx ═══════════════
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Check, X, RefreshCw } from 'lucide-react'
import { BASE_STYLES } from './shared-styles'

interface Request { id: number; user_id: number; plan_name: string; display_name: string; status: string; requested_at: string; email: string; company_name: string }

export function SubscriptionRequests() {
  const [requests, setRequests]     = useState<Request[]>([])
  const [loading, setLoading]       = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [loaded, setLoaded]         = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    try { const r = await api.get('/admin/subscription-requests'); setRequests(r.data); setTimeout(() => setLoaded(true), 50) }
    catch { alert('Erreur lors du chargement des demandes') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleApprove = async (id: number) => {
    if (!confirm("Approuver cette demande ? L'abonnement sera activé.")) return; setProcessingId(id)
    try { await api.post(`/admin/subscription-requests/${id}/approve`); await fetchRequests() }
    catch (error: any) { alert(error.response?.data?.error || "Erreur lors de l'approbation") }
    finally { setProcessingId(null) }
  }

  const handleReject = async (id: number) => {
    if (!confirm('Rejeter cette demande ?')) return; setProcessingId(id)
    try { await api.post(`/admin/subscription-requests/${id}/reject`); await fetchRequests() }
    catch (error: any) { alert(error.response?.data?.error || 'Erreur lors du rejet') }
    finally { setProcessingId(null) }
  }

  if (loading) return <Loader2Screen />

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div className="page-root relative z-10">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className={`flex justify-between items-center mb-8 fade-up ${loaded ? 'show' : ''}`}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700 }}>Demandes d'abonnement</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{requests.length} demande{requests.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn-ghost" onClick={fetchRequests}><RefreshCw size={15} /> Actualiser</button>
          </div>

          {requests.length === 0 ? (
            <div className={`glass p-12 text-center fade-up d1 ${loaded ? 'show' : ''}`}>
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>Aucune demande en attente ✓</p>
            </div>
          ) : (
            <div className={`glass fade-up d1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr>
                    <th>Utilisateur</th><th>Email</th><th>Plan</th>
                    <th>Date de demande</th><th className="right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 600 }}>{req.company_name || 'Nom non renseigné'}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{req.email}</td>
                        <td><span className="status-pill" style={{ color: '#6c8dff', background: 'rgba(108,141,255,.12)' }}>{req.display_name}</span></td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(req.requested_at).toLocaleString('fr-FR')}</td>
                        <td className="right">
                          <button className="icon-btn green" title="Approuver" onClick={() => handleApprove(req.id)} disabled={processingId === req.id}>
                            {processingId === req.id ? <RefreshCw size={16} style={{ animation: 'spin .7s linear infinite' }} /> : <Check size={16} />}
                          </button>
                          <button className="icon-btn red" title="Rejeter" onClick={() => handleReject(req.id)} disabled={processingId === req.id}>
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}

function Loader2Screen() {
  return (
    <>
      <style>{`.loader{width:36px;height:36px;border:3px solid rgba(108,141,255,.2);border-top-color:#6c8dff;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" /></div>
    </>
  )
}

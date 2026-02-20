import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Check, X, RefreshCw } from 'lucide-react';
import { SHARED_STYLES } from '../../shared-styles';

interface SubscriptionRequest {
  id: number;
  user_id: number;
  plan_name: string;
  display_name: string;
  status: string;
  requested_at: string;
  email: string;
  company_name: string;
}

export function AdminDashboard() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/admin/subscription-requests');
      setRequests(response.data);
      setTimeout(() => setLoaded(true), 50);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approuver cette demande ? L\'abonnement sera activé.')) return;
    setProcessingId(id);
    try {
      await api.post(`/admin/subscription-requests/${id}/approve`);
      await fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de l\'approbation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Rejeter cette demande ?')) return;
    setProcessingId(id);
    try {
      await api.post(`/admin/subscription-requests/${id}/reject`);
      await fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div className={`fade-up ${loaded ? 'show' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}>Gestion des demandes d'abonnement</h1>
            <button onClick={fetchRequests} className="btn-ghost">
              <RefreshCw size={16} style={{ marginRight: 8 }} />
              Actualiser
            </button>
          </div>

          {/* Tableau */}
          {requests.length === 0 ? (
            <div className="glass" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
              Aucune demande en attente
            </div>
          ) : (
            <div className={`glass fade-up delay-1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Date de demande</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 500 }}>{req.company_name || 'N/A'}</td>
                        <td style={{ color: 'var(--muted)' }}>{req.email}</td>
                        <td>
                          <span className="status-pill" style={{ color: 'var(--accent)', background: 'rgba(108,141,255,0.1)' }}>
                            {req.display_name}
                          </span>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{new Date(req.requested_at).toLocaleString()}</td>
                        <td className="right">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                            className="icon-btn green"
                            title="Approuver"
                          >
                            {processingId === req.id ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={processingId === req.id}
                            className="icon-btn red"
                            title="Rejeter"
                          >
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
    </>
  );
}

function LoadingScreen() {
  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader" />
      </div>
    </>
  );
}

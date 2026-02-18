import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Request {
  id: number;
  user_id: number;
  plan_name: string;
  display_name: string;
  status: string;
  requested_at: string;
  email: string;
  company_name: string;
}

export function SubscriptionRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/admin/subscription-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approuver cette demande ?')) return;
    try {
      await api.post(`/admin/subscription-requests/${id}/approve`);
      fetchRequests();
    } catch (error) {
      alert('Erreur');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Rejeter cette demande ?')) return;
    try {
      await api.post(`/admin/subscription-requests/${id}/reject`);
      fetchRequests();
    } catch (error) {
      alert('Erreur');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Demandes d'abonnement</h1>
      <table className="w-full bg-white shadow">
        <thead>
          <tr>
            <th className="p-2">Utilisateur</th>
            <th className="p-2">Email</th>
            <th className="p-2">Plan</th>
            <th className="p-2">Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td className="p-2">{req.company_name || req.email}</td>
              <td className="p-2">{req.email}</td>
              <td className="p-2">{req.display_name}</td>
              <td className="p-2">{new Date(req.requested_at).toLocaleString()}</td>
              <td className="p-2">
                <button
                  onClick={() => handleApprove(req.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Rejeter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Check, X, RefreshCw } from 'lucide-react';

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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/admin/subscription-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approuver cette demande ?')) return;
    setProcessingId(id);
    try {
      await api.post(`/admin/subscription-requests/${id}/approve`);
      await fetchRequests(); // Recharger la liste
    } catch (error) {
      alert('Erreur lors de l\'approbation');
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
    } catch (error) {
      alert('Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des demandes d'abonnement</h1>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Aucune demande en attente
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date demande</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {req.company_name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{req.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{req.display_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(req.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={processingId === req.id}
                      className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 mr-2 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id}
                      className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

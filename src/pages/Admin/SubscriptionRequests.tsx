import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Check, X, RefreshCw } from 'lucide-react';

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
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    if (!confirm('Approuver cette demande ? L\'abonnement sera activé.')) return;
    setProcessingId(id);
    try {
      await api.post(`/admin/subscription-requests/${id}/approve`);
      await fetchRequests(); // Recharger la liste
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Demandes d'abonnement</h1>
        <button
          onClick={fetchRequests}
          className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Aucune demande en attente
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de demande</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {req.company_name || 'Nom non renseigné'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{req.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {req.display_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(req.requested_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={processingId === req.id}
                      className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50"
                      title="Approuver"
                    >
                      {processingId === req.id ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Rejeter"
                    >
                      <X className="w-5 h-5" />
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

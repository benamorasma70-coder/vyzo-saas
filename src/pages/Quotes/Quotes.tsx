import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Eye, FileText, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Quote {
  id: string
  quote_number: string
  issue_date: string
  expiry_date: string
  total: number
  status: string
  customer_name: string
  contact_name: string
}

export function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes')
      setQuotes(response.data)
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async (id: string) => {
    if (!confirm('Convertir ce devis en facture ?')) return
    try {
      const response = await api.post(`/quotes/${id}/convert`)
      navigate(`/invoices/${response.data.invoiceId}`)
    } catch (error) {
      alert('Erreur lors de la conversion')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepté'
      case 'sent': return 'Envoyé'
      case 'rejected': return 'Refusé'
      case 'expired': return 'Expiré'
      default: return 'Brouillon'
    }
  }

  const filteredQuotes = quotes.filter(q => 
    q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div>Chargement...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={() => navigate('/quotes/new')}
          className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Devis
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Devis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredQuotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm text-gray-600">{quote.quote_number}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{quote.customer_name || quote.contact_name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{quote.issue_date}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{quote.expiry_date || '-'}</td>
                <td className="px-6 py-4 text-right font-medium">
                  {quote.total.toLocaleString()} DZD
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(quote.status)}`}>
                    {getStatusLabel(quote.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => navigate(`/quotes/${quote.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Voir"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {quote.status === 'draft' && (
                    <button
                      onClick={() => handleConvert(quote.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Convertir en facture"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

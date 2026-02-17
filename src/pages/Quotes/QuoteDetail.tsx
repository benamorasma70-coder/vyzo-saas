import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ArrowLeft } from 'lucide-react'

interface QuoteItem {
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

interface Quote {
  id: string
  quote_number: string
  issue_date: string
  expiry_date: string | null
  total: number
  status: string
  notes: string | null
  customer_name: string
  items: QuoteItem[]
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
  }).format(value)
}

export function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await api.get(`/quotes/${id}`)
      setQuote(response.data)
    } catch (error) {
      console.error('Error fetching quote:', error)
      setError('Erreur lors du chargement du devis')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchQuote()
    }
  }, [id, fetchQuote])

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return

    setUpdating(true)
    setError(null)

    try {
      await api.put(`/quotes/${id}`, { status: newStatus })
      setQuote({ ...quote, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
      setError('Erreur lors de la mise à jour du statut')
      // Revert the status change
      setQuote(quote)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Chargement...</div>
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
        <button
          onClick={() => navigate('/quotes')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Retour aux devis
        </button>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-10">Devis introuvable</div>
        <button
          onClick={() => navigate('/quotes')}
          className="text-blue-600 hover:underline"
        >
          Retour aux devis
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/quotes')}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux devis
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6 gap-4">
          <h1 className="text-2xl font-bold">Devis N° {quote.quote_number}</h1>
          <div className="flex items-center gap-2">
            <select
              value={quote.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="border rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="rejected">Refusé</option>
              <option value="expired">Expiré</option>
            </select>
            {updating && (
              <span className="text-sm text-gray-500">Mise à jour...</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Client</p>
            <p className="font-medium">{quote.customer_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date d'émission</p>
            <p>{new Date(quote.issue_date).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date d'expiration</p>
            <p>
              {quote.expiry_date
                ? new Date(quote.expiry_date).toLocaleDateString('fr-FR')
                : '-'}
            </p>
          </div>
        </div>

        <h3 className="font-semibold mb-2">Articles</h3>
        <div className="overflow-x-auto">
          <table className="w-full mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-right">Qté</th>
                <th className="px-4 py-2 text-right">P.U HT</th>
                <th className="px-4 py-2 text-right">TVA %</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items && quote.items.length > 0 ? (
                quote.items.map((item) => {
                  const total =
                    item.quantity * item.unit_price * (1 + item.tax_rate / 100)
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-2 text-right">{item.tax_rate}%</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                    Aucun article
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-72">
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total TTC:</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 font-medium">Notes</p>
            <p className="italic text-gray-700">{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

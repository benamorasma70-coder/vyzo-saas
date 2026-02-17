import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ArrowLeft, Save } from 'lucide-react'

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

export function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) fetchQuote()
  }, [id])

  const fetchQuote = async () => {
    try {
      const response = await api.get(`/quotes/${id}`)
      setQuote(response.data)
    } catch (error) {
      console.error('Error fetching quote:', error)
      alert('Erreur lors du chargement du devis')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return
    setUpdating(true)
    try {
      await api.put(`/quotes/${id}`, { status: newStatus })
      setQuote({ ...quote, status: newStatus })
      alert('Statut mis à jour')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="text-center py-10">Chargement...</div>
  if (!quote) return <div className="text-center py-10">Devis introuvable</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/quotes')}
        className="flex items-center text-blue-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux devis
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Devis N° {quote.quote_number}</h1>
          <div className="flex items-center gap-2">
            <select
              value={quote.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="border rounded px-3 py-2"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="rejected">Refusé</option>
              <option value="expired">Expiré</option>
            </select>
            {updating && <span className="text-sm text-gray-500">Mise à jour...</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Client</p>
            <p className="font-medium">{quote.customer_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date d'émission</p>
            <p>{quote.issue_date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date d'expiration</p>
            <p>{quote.expiry_date || '-'}</p>
          </div>
        </div>

        <h3 className="font-semibold mb-2">Articles</h3>
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
            {quote.items.map((item) => {
              const total = item.quantity * item.unit_price * (1 + item.tax_rate / 100)
              return (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{item.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{item.tax_rate}</td>
                  <td className="px-4 py-2 text-right">{total.toFixed(2)} DZD</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-72">
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total TTC:</span>
              <span>{quote.total.toFixed(2)} DZD</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Notes</p>
            <p className="italic">{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

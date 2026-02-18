import { useEffect, useState } from 'react'
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

  const updateStatus = async (newStatus: string) => {
    if (!quote) return
    setUpdating(true)
    try {
      await api.patch(`/quotes/${id}/status`, { status: newStatus })
      setQuote({ ...quote, status: newStatus })
      alert('Statut mis à jour')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  const handleConvert = async () => {
    if (!confirm('Convertir ce devis en facture ?')) return
    setUpdating(true)
    try {
      const response = await api.post(`/quotes/${id}/convert`)
      navigate(`/invoices/${response.data.invoiceId}`)
    } catch (error) {
      console.error('Conversion error:', error)
      alert('Erreur lors de la conversion')
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
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux devis
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Devis {quote.quote_number}</h1>
            <p className="text-gray-500">Créé le {quote.issue_date}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {quote.status === 'draft' && (
              <button
                onClick={handleConvert}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Convertir en facture
              </button>
            )}
            <select
              value={quote.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="border rounded-lg px-3 py-2 bg-white"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="rejected">Refusé</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-semibold mb-4">Client</h2>
          <p>{quote.customer_name}</p>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-semibold mb-4">Articles</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
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
                      <td className="px-4 py-2 text-right">{item.unit_price.toFixed(2)} DZD</td>
                      <td className="px-4 py-2 text-right">{item.tax_rate}%</td>
                      <td className="px-4 py-2 text-right">{total.toFixed(2)} DZD</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end">
          <div className="w-72">
            <div className="flex justify-between font-bold">
              <span>Total TTC :</span>
              <span>{quote.total.toFixed(2)} DZD</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-2">Notes</h2>
            <p className="text-gray-700">{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

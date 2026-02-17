import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ArrowLeft } from 'lucide-react'

interface DeliveryItem {
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

interface Delivery {
  id: string
  delivery_number: string
  delivery_date: string
  total: number
  status: string
  notes: string | null
  customer_name: string
  items: DeliveryItem[]
}

export function DeliveryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) fetchDelivery()
  }, [id])

  const fetchDelivery = async () => {
    try {
      const response = await api.get(`/deliveries/${id}`)
      setDelivery(response.data)
    } catch (error) {
      console.error('Error fetching delivery:', error)
      alert('Erreur lors du chargement du bon de livraison')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!delivery) return
    setUpdating(true)
    try {
      await api.put(`/deliveries/${id}`, { status: newStatus })
      setDelivery({ ...delivery, status: newStatus })
      alert('Statut mis à jour')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="text-center py-10">Chargement...</div>
  if (!delivery) return <div className="text-center py-10">Bon de livraison introuvable</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/deliveries')}
        className="flex items-center text-blue-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux BL
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">BL N° {delivery.delivery_number}</h1>
          <div className="flex items-center gap-2">
            <select
              value={delivery.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="border rounded px-3 py-2"
            >
              <option value="draft">Brouillon</option>
              <option value="delivered">Livré</option>
              <option value="invoiced">Facturé</option>
            </select>
            {updating && <span className="text-sm text-gray-500">Mise à jour...</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Client</p>
            <p className="font-medium">{delivery.customer_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date de livraison</p>
            <p>{delivery.delivery_date}</p>
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
            {delivery.items.map((item) => {
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
              <span>{delivery.total.toFixed(2)} DZD</span>
            </div>
          </div>
        </div>

        {delivery.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Notes</p>
            <p className="italic">{delivery.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

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

  const updateStatus = async (newStatus: string) => {
    if (!delivery) return
    setUpdating(true)
    try {
      await api.patch(`/deliveries/${id}/status`, { status: newStatus })
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
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux bons de livraison
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">BL N° {delivery.delivery_number}</h1>
            <p className="text-gray-500">Date de livraison : {delivery.delivery_date}</p>
          </div>
          <select
            value={delivery.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="draft">Brouillon</option>
            <option value="delivered">Livré</option>
            <option value="invoiced">Facturé</option>
          </select>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-semibold mb-4">Client</h2>
          <p>{delivery.customer_name}</p>
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
                {delivery.items.map((item) => {
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
              <span>{delivery.total.toFixed(2)} DZD</span>
            </div>
          </div>
        </div>

        {delivery.notes && (
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-2">Notes</h2>
            <p className="text-gray-700">{delivery.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

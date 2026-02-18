import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ArrowLeft, Download } from 'lucide-react'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  total: number
  paid_amount: number
  status: string
  customer_name: string
  notes?: string
  items: InvoiceItem[]
}

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`)
      setInvoice(response.data)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      alert('Erreur lors du chargement de la facture')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!invoice) return
    setUpdating(true)
    try {
      let data: any = { status: newStatus }
      if (newStatus === 'partial') {
        const amount = prompt('Montant payé (TND) ?', invoice.paid_amount?.toString() || '0')
        if (amount === null) {
          setUpdating(false)
          return
        }
        const paid = parseFloat(amount)
        if (isNaN(paid) || paid < 0 || paid > invoice.total) {
          alert('Montant invalide')
          setUpdating(false)
          return
        }
        data.paid_amount = paid
      } else if (newStatus === 'paid') {
        data.paid_amount = invoice.total
      }
      await api.patch(`/invoices/${id}/status`, data)
      fetchInvoice() // recharger les données à jour
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors du changement de statut')
    } finally {
      setUpdating(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `facture-${invoice?.invoice_number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Erreur lors du téléchargement')
    }
  }

  if (loading) return <div className="text-center py-10">Chargement...</div>
  if (!invoice) return <div className="text-center py-10">Facture non trouvée</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/invoices')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux factures
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Facture {invoice.invoice_number}</h1>
            <p className="text-gray-500">Créée le {invoice.issue_date}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <select
              value={invoice.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="border rounded-lg px-3 py-2 bg-white"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
              <option value="partial">Partiellement payée</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-semibold mb-4">Client</h2>
          <p>{invoice.customer_name}</p>
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
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{item.unit_price.toFixed(2)} TND</td>
                    <td className="px-4 py-2 text-right">{item.tax_rate}%</td>
                    <td className="px-4 py-2 text-right">
                      {(item.quantity * item.unit_price * (1 + item.tax_rate/100)).toFixed(2)} TND
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end">
          <div className="w-72">
            <div className="flex justify-between font-bold">
              <span>Total TTC :</span>
              <span>{invoice.total.toFixed(2)} TND</span>
            </div>
            {invoice.paid_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600 mt-1">
                <span>Payé :</span>
                <span>{invoice.paid_amount.toFixed(2)} TND</span>
              </div>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-2">Notes</h2>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

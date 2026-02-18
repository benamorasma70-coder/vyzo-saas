import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Eye, Download, FileText, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  total: number
  paid_amount: number
  status: string
  customer_name: string
  has_pdf: number
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [exporting, setExporting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices')
      setInvoices(response.data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePdf = async (id: string) => {
    setGeneratingPdf(id)
    try {
      const response = await api.post(`/invoices/${id}/generate-pdf`)
      window.open(response.data.pdf_url, '_blank')
      fetchInvoices()
    } catch (error) {
      alert('Erreur lors de la génération du PDF')
    } finally {
      setGeneratingPdf(null)
    }
  }

  const handleDownloadPDF = async (id: string, number: string) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `facture-${number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Erreur lors du téléchargement')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await api.get('/invoices/export', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'factures.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Erreur lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée'
      case 'overdue': return 'En retard'
      case 'partial': return 'Partiel'
      case 'sent': return 'Envoyée'
      default: return 'Brouillon'
    }
  }

  const filteredInvoices = invoices.filter(i => 
    i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="text-center py-10">Chargement...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {exporting ? 'Export...' : 'Exporter CSV'}
          </button>
          <button
            onClick={() => navigate('/invoices/new')}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Facture
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Émission</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">PDF</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm text-gray-600">{invoice.invoice_number}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{invoice.customer_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{invoice.issue_date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="font-medium">{invoice.total.toLocaleString()} TND</div>
                  {invoice.paid_amount > 0 && (
                    <div className="text-xs text-green-600">
                      Payé: {invoice.paid_amount.toLocaleString()} TND
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {invoice.has_pdf ? (
                    <span className="text-green-600" title="PDF disponible">
                      <FileText className="w-5 h-5 inline" />
                    </span>
                  ) : (
                    <span className="text-gray-300" title="PDF non généré">
                      <FileText className="w-5 h-5 inline" />
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Voir"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  {invoice.has_pdf ? (
                    <button
                      onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Télécharger PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGeneratePdf(invoice.id)}
                      disabled={generatingPdf === invoice.id}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                      title="Générer PDF"
                    >
                      {generatingPdf === invoice.id ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
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

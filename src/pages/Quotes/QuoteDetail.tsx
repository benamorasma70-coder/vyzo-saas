import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ArrowLeft } from 'lucide-react'

// Types
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

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
  }).format(value)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Sub-components
interface HeaderProps {
  quoteNumber: string
  status: string
  updating: boolean
  onStatusChange: (status: string) => void
}

function QuoteHeader({ quoteNumber, status, updating, onStatusChange }: HeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6 gap-4">
      <h1 className="text-2xl font-bold">Devis N° {quoteNumber}</h1>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
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
  )
}

interface QuoteInfoProps {
  customerName: string
  issueDate: string
  expiryDate: string | null
}

function QuoteInfo({ customerName, issueDate, expiryDate }: QuoteInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p className="text-sm text-gray-600">Client</p>
        <p className="font-medium">{customerName}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Date d'émission</p>
        <p>{formatDate(issueDate)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Date d'expiration</p>
        <p>{expiryDate ? formatDate(expiryDate) : '-'}</p>
      </div>
    </div>
  )
}

interface QuoteItemsTableProps {
  items: QuoteItem[]
}

function QuoteItemsTable({ items }: QuoteItemsTableProps) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Articles</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
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
            {items && items.length > 0 ? (
              items.map((item) => <QuoteItemRow key={item.id} item={item} />)
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
    </div>
  )
}

interface QuoteItemRowProps {
  item: QuoteItem
}

function QuoteItemRow({ item }: QuoteItemRowProps) {
  const total = item.quantity * item.unit_price * (1 + item.tax_rate / 100)

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">{item.description}</td>
      <td className="px-4 py-2 text-right">{item.quantity}</td>
      <td className="px-4 py-2 text-right">{formatCurrency(item.unit_price)}</td>
      <td className="px-4 py-2 text-right">{item.tax_rate}%</td>
      <td className="px-4 py-2 text-right font-medium">
        {formatCurrency(total)}
      </td>
    </tr>
  )
}

interface QuoteTotalProps {
  total: number
}

function QuoteTotal({ total }: QuoteTotalProps) {
  return (
    <div className="flex justify-end mb-6">
      <div className="w-72">
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total TTC:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

interface QuoteNotesProps {
  notes: string | null
}

function QuoteNotes({ notes }: QuoteNotesProps) {
  if (!notes) return null

  return (
    <div className="p-4 bg-gray-50 rounded">
      <p className="text-sm text-gray-600 font-medium">Notes</p>
      <p className="italic text-gray-700">{notes}</p>
    </div>
  )
}

interface BackButtonProps {
  onClick: () => void
}

function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux devis
    </button>
  )
}

interface LoadingStateProps {
  message?: string
}

function LoadingState({ message = 'Chargement...' }: LoadingStateProps) {
  return <div className="text-center py-10 text-gray-600">{message}</div>
}

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
        {error}
      </div>
      <button
        onClick={onRetry}
        className="text-blue-600 hover:text-blue-700 transition-colors"
      >
        ← Retour aux devis
      </button>
    </div>
  )
}

interface NotFoundStateProps {
  onRetry: () => void
}

function NotFoundState({ onRetry }: NotFoundStateProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Devis introuvable</p>
        <button
          onClick={onRetry}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          ← Retour aux devis
        </button>
      </div>
    </div>
  )
}

interface QuoteContentProps {
  quote: Quote
  updating: boolean
  onStatusChange: (status: string) => void
  onNavigateBack: () => void
}

function QuoteContent({
  quote,
  updating,
  onStatusChange,
  onNavigateBack,
}: QuoteContentProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <BackButton onClick={onNavigateBack} />

      <div className="bg-white rounded-lg shadow p-6">
        <QuoteHeader
          quoteNumber={quote.quote_number}
          status={quote.status}
          updating={updating}
          onStatusChange={onStatusChange}
        />

        <QuoteInfo
          customerName={quote.customer_name}
          issueDate={quote.issue_date}
          expiryDate={quote.expiry_date}
        />

        <QuoteItemsTable items={quote.items} />

        <QuoteTotal total={quote.total} />

        <QuoteNotes notes={quote.notes} />
      </div>
    </div>
  )
}

// Main component
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
      setQuote(quote)
    } finally {
      setUpdating(false)
    }
  }

  const handleNavigateBack = () => navigate('/quotes')

  // Render states
  if (loading) {
    return <LoadingState />
  }

  if (error && !quote) {
    return <ErrorState error={error} onRetry={handleNavigateBack} />
  }

  if (!quote) {
    return <NotFoundState onRetry={handleNavigateBack} />
  }

  return (
    <QuoteContent
      quote={quote}
      updating={updating}
      onStatusChange={handleStatusChange}
      onNavigateBack={handleNavigateBack}
    />
  )
}

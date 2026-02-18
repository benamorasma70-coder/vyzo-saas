import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Plus, Trash2 } from 'lucide-react'

interface Customer {
  id: string
  company_name: string
  contact_name: string
}

interface Product {
  id: string
  name: string
  sale_price: number
  tax_rate: number
  unit: string
}

interface InvoiceItem {
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

export function InvoiceForm() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 19 }
  ])
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers')
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 19 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleProductSelect = (index: number, productId: string) => {
    if (!productId) return;
    // Convertir l'ID du produit en chaîne pour la comparaison
    const product = products.find(p => String(p.id) === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        description: product.name,
        unitPrice: product.sale_price,
        taxRate: product.tax_rate  // maintenant tax_rate existe
      };
      setItems(newItems);
    } else {
      console.warn('Produit non trouvé pour ID:', productId);
    }
  }

  const calculateTotals = () => {
    let subtotal = 0
    let taxTotal = 0
    items.forEach(item => {
      const total = item.quantity * item.unitPrice
      const tax = total * (item.taxRate / 100)
      subtotal += total
      taxTotal += tax
    })
    return { subtotal, taxTotal, total: subtotal + taxTotal }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/invoices', {
        customerId,
        items,
        issueDate,
        dueDate,
        notes,
      })
      navigate('/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Erreur lors de la création de la facture')
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nouvelle Facture</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select 
                  value={customerId} 
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name || customer.contact_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'émission</label>
                  <input 
                    type="date" 
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Articles</h3>
              <button 
                type="button"
                onClick={addItem}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </button>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Produit / Description</th>
                  <th className="px-4 py-2 text-right">Qté</th>
                  <th className="px-4 py-2 text-right">P.U HT</th>
                  <th className="px-4 py-2 text-right">TVA %</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <select
                          className="w-1/3 border rounded px-2 py-1"
                          value={item.productId || ''}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                        >
                          <option value="">Saisie manuelle</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.unit})
                            </option>
                          ))}
                        </select>
                        <input 
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-2/3 border rounded px-2 py-1"
                          placeholder="Description"
                          required
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-20 border rounded px-2 py-1 text-right"
                        min="1"
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                        className="w-24 border rounded px-2 py-1 text-right"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value))}
                        className="w-20 border rounded px-2 py-1 text-right"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {(item.quantity * item.unitPrice * (1 + item.taxRate/100)).toFixed(2)} DZD
                    </td>
                    <td className="px-4 py-2">
                      {items.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total HT:</span>
                <span>{totals.subtotal.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total TVA:</span>
                <span>{totals.taxTotal.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC:</span>
                <span>{totals.total.toFixed(2)} TND</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 h-24"
              placeholder="Conditions de paiement, notes particulières..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer la facture'}
          </button>
        </div>
      </form>
    </div>
  )
}




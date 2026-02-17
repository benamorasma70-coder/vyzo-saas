import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { TrendingUp, Users, Package, FileText, DollarSign, AlertCircle } from 'lucide-react'

export function Dashboard() {
  const { user, subscription } = useAuth()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const response = await api.get('/dashboard/stats')
    setStats(response.data)
  }

  if (!stats) return <div>Chargement...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user?.companyName}
        </h1>
        <p className="text-gray-500 mt-1">
          Plan actuel: <span className="font-medium text-blue-600">{subscription?.display_name}</span>
          {subscription?.expires_soon && (
            <span className="ml-2 text-yellow-600 text-sm">
              (Expire dans {subscription.days_remaining} jours)
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Clients" value={stats.totalCustomers} icon={Users} trend="+12%" color="blue" />
        <StatCard title="Produits" value={stats.totalProducts} icon={Package} trend="+5%" color="green" />
        <StatCard title="Factures (Ce mois)" value={stats.monthlyInvoices} icon={FileText} trend="+23%" color="purple" />
        <StatCard title="Chiffre d'affaires" value={`${stats.monthlyRevenue.toLocaleString()} DZD`} icon={DollarSign} trend="+18%" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Alertes Stock</h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-gray-500">Aucune alerte</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="text-red-600 font-bold">{product.stock_quantity} restant</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Dernières Factures</h3>
          <div className="space-y-3">
            {stats.recentInvoices.map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="text-sm text-gray-500">{invoice.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{invoice.total.toLocaleString()} DZD</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Payée' : 
                     invoice.status === 'overdue' ? 'En retard' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-green-600 font-medium">{trend}</span>
        <span className="text-gray-500 ml-2">vs mois dernier</span>
      </div>
    </div>
  )
}

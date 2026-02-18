import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Users, Package, FileText, DollarSign, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface Stats {
  totalCustomers: number
  totalProducts: number
  monthlyInvoices: number
  monthlyRevenue: number
  lowStock: Array<{ id: string; name: string; stock_quantity: number }>
  recentInvoices: Array<{
    id: string
    invoice_number: string
    total: number
    status: string
    customer_name: string
  }>
  trends: {
    customers: number
    products: number
    invoices: number
    revenue: number
  }
}

export function Dashboard() {
  const { user, subscription } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  if (!stats) return <div className="text-center py-10">Chargement...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user?.companyName}
        </h1>
        <p className="text-gray-500 mt-1">
          Plan actuel : <span className="font-medium text-blue-600">{subscription?.display_name || 'Gratuit'}</span>
          {subscription && (
            <span className="ml-2 text-xs text-gray-400">
              (expire le {new Date(subscription.expires_at).toLocaleDateString()})
            </span>
          )}
          {subscription?.expires_soon && (
            <span className="ml-2 text-yellow-600 text-sm">
              (Expire dans {subscription.days_remaining} jours)
            </span>
          )}
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Clients"
          value={stats.totalCustomers}
          icon={Users}
          trend={stats.trends.customers}
          color="blue"
        />
        <StatCard
          title="Produits"
          value={stats.totalProducts}
          icon={Package}
          trend={stats.trends.products}
          color="green"
        />
        <StatCard
          title="Factures (ce mois)"
          value={stats.monthlyInvoices}
          icon={FileText}
          trend={stats.trends.invoices}
          color="purple"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.monthlyRevenue.toLocaleString()} TND`}
          icon={DollarSign}
          trend={stats.trends.revenue}
          color="orange"
        />
      </div>

      {/* Alertes stock et dernières factures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertes Stock</h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-gray-500">Aucune alerte</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <span className="font-medium text-gray-700">{product.name}</span>
                  </div>
                  <span className="text-red-600 font-bold">{product.stock_quantity} restant</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dernières factures */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dernières Factures</h3>
          <div className="space-y-3">
            {stats.recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{invoice.invoice_number}</p>
                  <p className="text-sm text-gray-500">{invoice.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{invoice.total.toLocaleString()} TND</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {invoice.status === 'paid'
                      ? 'Payée'
                      : invoice.status === 'overdue'
                      ? 'En retard'
                      : 'En attente'}
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

// Composant de carte avec tendance dynamique
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  trend: number
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-600',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      icon: 'text-orange-600',
    },
  }

  const trendColor = trend >= 0 ? 'text-green-600' : 'text-red-600'
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color].bg}`}>
          <Icon className={`w-6 h-6 ${colors[color].icon}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <TrendIcon className={`w-4 h-4 mr-1 ${trendColor}`} />
        <span className={`font-medium ${trendColor}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
        <span className="text-gray-500 ml-2">vs mois dernier</span>
      </div>
    </div>
  )
}


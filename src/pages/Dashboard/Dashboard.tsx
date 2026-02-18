import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { 
  TrendingUp, Users, Package, FileText, DollarSign, 
  AlertCircle, ArrowUp, ArrowDown 
} from 'lucide-react'

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

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  // Formatage des nombres
  const formatNumber = (num: number) => num.toLocaleString('fr-FR')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bonjour, {user?.companyName || 'utilisateur'}
          </h1>
          <div className="flex items-center mt-2 text-gray-600">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {subscription?.display_name || 'Gratuit'}
            </span>
            {subscription?.expires_soon && (
              <span className="ml-3 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                Expire dans {subscription.days_remaining} jours
              </span>
            )}
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Clients"
            value={stats.totalCustomers}
            icon={Users}
            trend={stats.trends?.customers}
            color="blue"
          />
          <StatCard
            title="Produits"
            value={stats.totalProducts}
            icon={Package}
            trend={stats.trends?.products}
            color="green"
          />
          <StatCard
            title="Factures (ce mois)"
            value={stats.monthlyInvoices}
            icon={FileText}
            trend={stats.trends?.invoices}
            color="purple"
          />
          <StatCard
            title="Chiffre d'affaires"
            value={`${formatNumber(stats.monthlyRevenue)} TND`}
            icon={DollarSign}
            trend={stats.trends?.revenue}
            color="orange"
          />
        </div>

        {/* Deux colonnes : Alertes stock + Dernières factures */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertes stock */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                Alertes Stock
              </h3>
            </div>
            <div className="p-6">
              {stats.lowStock.length === 0 ? (
                <p className="text-gray-500 text-center py-8">✅ Aucun produit en stock critique</p>
              ) : (
                <div className="space-y-3">
                  {stats.lowStock.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
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
          </div>

          {/* Dernières factures */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                Dernières factures
              </h3>
            </div>
            <div className="p-6">
              {stats.recentInvoices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune facture récente</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentInvoices.map((invoice: any) => {
                    const statusConfig = {
                      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Payée' },
                      overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'En retard' },
                      default: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' }
                    }
                    const status = invoice.status === 'paid' ? 'paid' : invoice.status === 'overdue' ? 'overdue' : 'default'
                    const { bg, text, label } = statusConfig[status]
                    return (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-800">{invoice.invoice_number}</p>
                          <p className="text-sm text-gray-500">{invoice.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatNumber(invoice.total)} TND</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${bg} ${text}`}>
                            {label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-500',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-500',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      icon: 'text-orange-500',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600'
    }
  }

  const isTrendPositive = trend && !trend.startsWith('-')
  const trendValue = trend ? (trend.startsWith('+') ? trend : `−${trend.substring(1)}`) : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color].bg}`}>
          <Icon className={`w-6 h-6 ${colors[color].icon}`} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {isTrendPositive ? (
            <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`font-medium ${isTrendPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
          <span className="text-gray-400 ml-2">vs mois dernier</span>
        </div>
      )}
    </div>
  )
}

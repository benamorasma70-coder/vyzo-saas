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
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data)
      setTimeout(() => setLoaded(true), 50)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  if (!stats) return <LoadingScreen />

  return (
    <>
      <style>{`
        :root {
          --bg:        #0d0f14;
          --surface:   rgba(255,255,255,0.045);
          --border:    rgba(255,255,255,0.08);
          --accent:    #6c8dff;
          --accent2:   #a78bfa;
          --text:      #e8eaf0;
          --muted:     #6b7280;
          --success:   #34d399;
          --danger:    #f87171;
          --warning:   #fbbf24;
        }

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          min-height: 100vh;
          color: var(--text);
          position: relative;
          z-index: 10;
        }

        .dash-root::before {
          content: '';
          position: fixed;
          top: -200px; left: -200px;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(108,141,255,.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .dash-root::after {
          content: '';
          position: fixed;
          bottom: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(167,139,250,.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .glass {
          background: var(--surface);
          border: 1px solid var(--border);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-radius: 16px;
          transition: border-color .25s, box-shadow .25s;
        }
        .glass:hover {
          border-color: rgba(255,255,255,.14);
          box-shadow: 0 8px 40px rgba(0,0,0,.35);
        }

        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .fade-up.show {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-1 { transition-delay: .05s; }
        .delay-2 { transition-delay: .10s; }
        .delay-3 { transition-delay: .15s; }
        .delay-4 { transition-delay: .20s; }
        .delay-5 { transition-delay: .25s; }
        .delay-6 { transition-delay: .30s; }

        .icon-wrap {
          border-radius: 12px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          background: linear-gradient(135deg, rgba(108,141,255,.22), rgba(167,139,250,.22));
          border: 1px solid rgba(108,141,255,.35);
          color: #a5b4fc;
          letter-spacing: .3px;
        }

        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 99px;
          letter-spacing: .3px;
        }

        .trend-bar {
          height: 3px;
          border-radius: 99px;
          margin-top: 16px;
          background: var(--border);
          overflow: hidden;
          position: relative;
        }
        .trend-bar-fill {
          position: absolute; top:0; left:0; height:100%;
          border-radius: 99px;
          transition: width 1s ease;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .loader {
          width: 36px; height: 36px;
          border: 3px solid rgba(108,141,255,.2);
          border-top-color: #6c8dff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
      `}</style>

      <div className="dash-root">
        <div className="px-6 py-10 max-w-7xl mx-auto">

          {/* En-tête */}
          <div className={`mb-10 fade-up ${loaded ? 'show' : ''}`}>
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.5px' }}>
              Bonjour,{' '}
              <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.companyName}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="plan-badge">
                ✦ {subscription?.display_name || 'Gratuit'}
              </span>
              {subscription && (
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                  expire le {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                </span>
              )}
              {subscription?.expires_soon && (
                <span style={{ color: 'var(--warning)', fontSize: 13, fontWeight: 500 }}>
                  ⚡ Expire dans {subscription.days_remaining} jours
                </span>
              )}
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { title: 'Clients',          value: stats.totalCustomers,                              icon: Users,    trend: stats.trends.customers, accent: '#6c8dff', delay: 'delay-1' },
              { title: 'Produits',         value: stats.totalProducts,                               icon: Package,  trend: stats.trends.products,  accent: '#34d399', delay: 'delay-2' },
              { title: 'Factures / mois',  value: stats.monthlyInvoices,                             icon: FileText, trend: stats.trends.invoices,  accent: '#a78bfa', delay: 'delay-3' },
              { title: "Chiffre d'aff.",   value: `${stats.monthlyRevenue.toLocaleString()} TND`,    icon: DollarSign, trend: stats.trends.revenue, accent: '#fbbf24', delay: 'delay-4' },
            ].map(({ title, value, icon: Icon, trend, accent, delay }) => (
              <div key={title} className={`glass p-5 fade-up ${delay} ${loaded ? 'show' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase' }}>
                      {title}
                    </p>
                    <p style={{ fontSize: 28, fontWeight: 700, marginTop: 6, fontFamily: "'Playfair Display', serif" }}>
                      {value}
                    </p>
                  </div>
                  <div className="icon-wrap" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
                    <Icon size={20} style={{ color: accent }} />
                  </div>
                </div>

                <div className="trend-bar">
                  <div
                    className="trend-bar-fill"
                    style={{
                      width: `${Math.min(Math.abs(trend), 100)}%`,
                      background: trend >= 0 ? 'var(--success)' : 'var(--danger)',
                    }}
                  />
                </div>

                <div className="flex items-center gap-1 mt-2" style={{ fontSize: 12 }}>
                  {trend >= 0
                    ? <TrendingUp size={13} style={{ color: 'var(--success)' }} />
                    : <TrendingDown size={13} style={{ color: 'var(--danger)' }} />}
                  <span style={{ color: trend >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </span>
                  <span style={{ color: 'var(--muted)' }}>vs mois dernier</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alertes + Factures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Alertes stock */}
            <div className={`glass p-6 fade-up delay-5 ${loaded ? 'show' : ''}`}>
              <SectionHeader label="Alertes Stock" dot="#f87171" />
              {stats.lowStock.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 12 }}>Aucune alerte en cours ✓</p>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  {stats.lowStock.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(248,113,113,.07)',
                        border: '1px solid rgba(248,113,113,.18)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{product.name}</span>
                      </div>
                      <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 13 }}>
                        {product.stock_quantity} restant
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dernières factures */}
            <div className={`glass p-6 fade-up delay-6 ${loaded ? 'show' : ''}`}>
              <SectionHeader label="Dernières Factures" dot="var(--accent)" />
              <div className="flex flex-col gap-3 mt-4">
                {stats.recentInvoices.map((invoice) => {
                  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                    paid:    { label: 'Payée',     color: '#34d399', bg: 'rgba(52,211,153,.12)' },
                    overdue: { label: 'En retard', color: '#f87171', bg: 'rgba(248,113,113,.12)' },
                  }
                  const s = statusMap[invoice.status] ?? { label: 'En attente', color: '#fbbf24', bg: 'rgba(251,191,36,.12)' }

                  return (
                    <div
                      key={invoice.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        transition: 'background .2s',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{invoice.invoice_number}</p>
                        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{invoice.customer_name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Playfair Display', serif" }}>
                          {invoice.total.toLocaleString()} TND
                        </p>
                        <span
                          className="status-badge"
                          style={{ color: s.color, background: s.bg, display: 'inline-block', marginTop: 4 }}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SectionHeader({ label, dot }: { label: string; dot: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
      <h3 style={{ fontWeight: 600, fontSize: 15, letterSpacing: '.2px' }}>{label}</h3>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader" />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BASE_STYLES } from './shared-styles'

interface Plan { id: string; name: string; display_name: string; price_monthly: number; duration_months: number; features: string }

const PLAN_STYLES = `
  .plan-card {
    background: rgba(255,255,255,.045);
    border: 1px solid rgba(255,255,255,.08);
    backdrop-filter: blur(18px);
    border-radius: 20px;
    padding: 32px 28px;
    display: flex; flex-direction: column;
    transition: border-color .25s, box-shadow .3s, transform .2s;
    cursor: default;
  }
  .plan-card:hover { border-color: rgba(108,141,255,.3); box-shadow: 0 12px 48px rgba(108,141,255,.12); transform: translateY(-3px); }
  .plan-card.active { border-color: rgba(108,141,255,.5); box-shadow: 0 0 0 1px rgba(108,141,255,.3), 0 12px 48px rgba(108,141,255,.15); }
  .plan-icon-wrap { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .check-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 14px; color: rgba(232,234,240,.8); }
`

const ICON_MAP: Record<string, { icon: typeof Star; color: string; bg: string }> = {
  free:     { icon: Star,  color: '#fbbf24', bg: 'rgba(251,191,36,.15)' },
  monthly:  { icon: Zap,   color: '#6c8dff', bg: 'rgba(108,141,255,.15)' },
  semester: { icon: Check, color: '#a78bfa', bg: 'rgba(167,139,250,.15)' },
  yearly:   { icon: Crown, color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
}

export function SubscriptionPlans() {
  const [plans, setPlans]       = useState<Plan[]>([])
  const [loading, setLoading]   = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [loaded, setLoaded]     = useState(false)
  const { subscription }        = useAuth()
  const navigate                = useNavigate()

  useEffect(() => { fetchPlans() }, [])

  const fetchPlans = async () => {
    try { const r = await api.get('/subscriptions/plans'); setPlans(r.data); setTimeout(() => setLoaded(true), 50) }
    catch { console.error('Error fetching plans') }
    finally { setLoading(false) }
  }

  const handleRequest = async (planId: string) => {
    setRequesting(planId)
    try { await api.post('/subscriptions/request', { planId }); alert("Demande envoyée. Vous recevrez une confirmation après validation par l'administrateur."); navigate('/') }
    catch (error: any) { alert(error.response?.data?.error || 'Erreur lors de la demande') }
    finally { setRequesting(null) }
  }

  const getPlanFeatures = (plan: Plan) => {
    const features = JSON.parse(plan.features || '[]')
    return features.length > 0 ? features : ['Clients illimités', 'Produits illimités', 'Factures illimitées', 'Support email']
  }

  if (loading) return <Loader />

  return (
    <>
      <style>{BASE_STYLES + PLAN_STYLES}</style>
      <div className="page-root relative z-10" style={{ minHeight: '100vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div className={`text-center mb-14 fade-up ${loaded ? 'show' : ''}`}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 700, marginBottom: 12 }}>
              Choisissez votre{' '}
              <span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>forfait</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 16 }}>Commencez gratuitement pendant 1 mois, puis choisissez le plan qui vous convient</p>
            {subscription && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '8px 20px', borderRadius: 99, background: 'rgba(108,141,255,.12)', border: '1px solid rgba(108,141,255,.3)' }}>
                <span style={{ color: '#a5b4fc', fontSize: 14 }}>
                  Forfait actuel : <strong>{subscription.display_name}</strong>
                  {' · '}expire le {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => {
              const cfg = ICON_MAP[plan.name] ?? ICON_MAP.free
              const IconComponent = cfg.icon
              const isActive = subscription?.plan_name === plan.name
              const features = getPlanFeatures(plan)

              return (
                <div key={plan.id} className={`plan-card ${isActive ? 'active' : ''} fade-up ${['d1','d2','d3','d4'][idx] ?? ''} ${loaded ? 'show' : ''}`}>
                  {isActive && (
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(108,141,255,.12)', padding: '3px 12px', borderRadius: 99, border: '1px solid rgba(108,141,255,.3)' }}>Actif</span>
                    </div>
                  )}

                  <div className="plan-icon-wrap" style={{ background: cfg.bg }}>
                    <IconComponent size={26} style={{ color: cfg.color }} />
                  </div>

                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>{plan.display_name}</h3>

                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    {plan.price_monthly ? (
                      <>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {plan.price_monthly.toLocaleString()}
                        </span>
                        <span style={{ color: 'var(--muted)', fontSize: 14 }}> TND/mois</span>
                      </>
                    ) : (
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: 'var(--success)' }}>Gratuit</span>
                    )}
                  </div>

                  <ul style={{ flex: 1, marginBottom: 24 }}>
                    {features.map((f: string, i: number) => (
                      <li key={i} className="check-item">
                        <Check size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !isActive && handleRequest(plan.id)}
                    disabled={requesting === plan.id || isActive}
                    className={isActive ? 'btn-ghost' : 'btn-primary'}
                    style={{ width: '100%', justifyContent: 'center', opacity: isActive ? .6 : 1, cursor: isActive ? 'default' : 'pointer' }}
                  >
                    {isActive ? 'Forfait actuel'
                      : requesting === plan.id ? 'Traitement...'
                      : plan.name === 'free' ? 'Commencer gratuitement'
                      : 'Demander ce forfait'}
                  </button>
                </div>
              )
            })}
          </div>

          <p className={`text-center mt-12 fade-up d4 ${loaded ? 'show' : ''}`} style={{ color: 'var(--muted)', fontSize: 13 }}>
            Tous les forfaits incluent : Sauvegarde automatique · SSL sécurisé · Mises à jour gratuites
            <br />Besoin d'aide ? <a href="mailto:contactt@easydev.tn" style={{ color: 'var(--accent)' }}>contactt@easydev.tn</a>
          </p>
        </div>
      </div>
    </>
  )
}

function Loader() {
  return (
    <>
      <style>{`.loader{width:36px;height:36px;border:3px solid rgba(108,141,255,.2);border-top-color:#6c8dff;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" /></div>
    </>
  )
}

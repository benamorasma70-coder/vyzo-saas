import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SHARED_STYLES } from '../../shared-styles';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  duration_months: number;
  features: string;
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const { subscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (planId: string) => {
    setRequesting(planId);
    try {
      await api.post('/subscriptions/request', { planId });
      alert('Demande envoyée. Vous recevrez une confirmation après validation par l\'administrateur.');
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la demande');
    } finally {
      setRequesting(null);
    }
  };

  const getPlanIcon = (name: string) => {
    switch (name) {
      case 'free': return <Star className="w-8 h-8 text-yellow-500" />;
      case 'monthly': return <Zap className="w-8 h-8 text-blue-500" />;
      case 'semester': return <Check className="w-8 h-8 text-purple-500" />;
      case 'yearly': return <Crown className="w-8 h-8 text-orange-500" />;
      default: return <Star className="w-8 h-8 text-gray-500" />;
    }
  };

  const getPlanFeatures = (plan: Plan) => {
    const features = JSON.parse(plan.features || '[]');
    return features.length > 0 ? features : [
      'Clients illimités',
      'Produits illimités',
      'Factures illimitées',
      'Support email',
    ];
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, marginBottom: 16 }}>
              Choisissez votre forfait
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 16 }}>
              Commencez gratuitement pendant 1 mois, puis choisissez le plan qui vous convient
            </p>
            {subscription && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(108,141,255,0.1)', borderRadius: 12, display: 'inline-block' }}>
                <p style={{ color: 'var(--accent)' }}>
                  Forfait actuel : <strong>{subscription.display_name}</strong><br />
                  Expire le : {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {plans.map((plan) => (
              <div key={plan.id} className={`plan-card ${subscription?.plan_name === plan.name ? 'active' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  {getPlanIcon(plan.name)}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{plan.display_name}</h3>
                <div style={{ marginBottom: 24 }}>
                  {plan.price_monthly ? (
                    <>
                      <span style={{ fontSize: 32, fontWeight: 700 }}>{plan.price_monthly.toLocaleString()}</span>
                      <span style={{ color: 'var(--muted)' }}> DZD/mois</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--success)' }}>Gratuit</span>
                  )}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32, textAlign: 'left' }}>
                  {getPlanFeatures(plan).map((feature: string, idx: number) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, color: 'var(--muted)' }}>
                      <Check size={16} style={{ color: 'var(--success)', marginRight: 8, flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleRequest(plan.id)}
                  disabled={requesting === plan.id || subscription?.plan_name === plan.name}
                  className={subscription?.plan_name === plan.name ? 'btn-ghost' : 'btn-primary'}
                  style={{ width: '100%' }}
                >
                  {subscription?.plan_name === plan.name
                    ? 'Actif'
                    : requesting === plan.id
                    ? 'Traitement...'
                    : plan.name === 'free'
                    ? 'Commencer gratuitement'
                    : 'Demander'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, color: 'var(--muted)', fontSize: 14 }}>
            <p>Tous les forfaits incluent : sauvegarde automatique, SSL sécurisé, mises à jour gratuites</p>
            <p style={{ marginTop: 8 }}>Besoin d'aide ? Contactez-nous à contact@vyzo.com</p>
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingScreen() {
  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader" />
      </div>
    </>
  );
}

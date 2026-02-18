import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const { subscription, refreshUser } = useAuth(); // ← user supprimé car non utilisé
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

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      await api.post('/subscriptions/subscribe', { planId });
      await refreshUser();
      navigate('/');
    } catch (error) {
      alert('Erreur lors de l\'abonnement');
    } finally {
      setSubscribing(null);
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

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choisissez votre forfait</h1>
          <p className="text-lg text-gray-600">
            Commencez gratuitement pendant 1 mois, puis choisissez le plan qui vous convient
          </p>
          {subscription && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg inline-block">
              <p className="text-blue-800">
                Forfait actuel: <strong>{subscription.display_name}</strong>
                <br />
                Expire le: {new Date(subscription.expires_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
                subscription?.plan_name === plan.name
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-transparent'
              }`}
            >
              <div className="p-8">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.name)}
                </div>
                
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  {plan.display_name}
                </h3>
                
                <div className="text-center mb-6">
                  {plan.price_monthly ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price_monthly.toLocaleString()}
                      </span>
                      <span className="text-gray-500"> DZD/mois</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-green-600">Gratuit</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {getPlanFeatures(plan).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id || subscription?.plan_name === plan.name}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    subscription?.plan_name === plan.name
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                  }`}
                >
                  {subscription?.plan_name === plan.name
                    ? 'Actif'
                    : subscribing === plan.id
                    ? 'Traitement...'
                    : plan.name === 'free'
                    ? 'Commencer gratuitement'
                    : 'S\'abonner'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Tous les forfaits incluent: Sauvegarde automatique, SSL sécurisé, Mises à jour gratuites</p>
          <p className="mt-2">Besoin d'aide ? Contactez-nous à support@vyzo.app</p>
        </div>
      </div>
    </div>
  );
}

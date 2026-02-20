import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { SHARED_STYLES } from '../../shared-styles';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      // Le backend renvoie un message neutre (sécurité)
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass" style={{ maxWidth: 400, width: '100%', padding: 32 }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', marginBottom: 24, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Retour
          </Link>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Mot de passe oublié ?
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
            Saisissez votre adresse e‑mail. Vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>

          {message && (
            <div style={{ padding: 12, background: 'rgba(52,211,153,0.1)', border: '1px solid var(--success)', borderRadius: 8, color: 'var(--success)', marginBottom: 20, fontSize: 14 }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ padding: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 40 }}
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? <Loader2 className="spin" size={18} /> : 'Envoyer le lien'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

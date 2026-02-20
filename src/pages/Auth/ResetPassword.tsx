import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { SHARED_STYLES } from '../../shared-styles';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError('Lien invalide ou expiré.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
      if (err.response?.status === 400) setValidToken(false);
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

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Nouveau mot de passe</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          {message && (
            <div style={{ padding: 12, background: 'rgba(52,211,153,0.1)', border: '1px solid var(--success)', borderRadius: 8, color: 'var(--success)', marginBottom: 20, fontSize: 14 }}>
              {message} Redirection vers la connexion...
            </div>
          )}

          {error && (
            <div style={{ padding: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          {validToken ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    style={{ paddingLeft: 40 }}
                    placeholder="Minimum 8 caractères"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Confirmer le mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    style={{ paddingLeft: 40 }}
                    placeholder="Confirmez"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <Loader2 className="spin" size={18} /> : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          ) : (
            <p style={{ color: 'var(--danger)', textAlign: 'center' }}>
              Le lien de réinitialisation est invalide ou a expiré. <Link to="/forgot-password">Demander un nouveau lien</Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

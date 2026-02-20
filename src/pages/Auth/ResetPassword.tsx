import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { SHARED_STYLES } from '../../shared-styles';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div className="glass" style={{ maxWidth: 400, margin: '50px auto', padding: 32 }}>
          <h1>Nouveau mot de passe</h1>
          {message && <p style={{ color: 'green' }}>{message}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {token ? (
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                required
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirmer"
                required
              />
              <button type="submit">Réinitialiser</button>
            </form>
          ) : (
            <p>Lien invalide ou expiré.</p>
          )}
        </div>
      </div>
    </>
  );
}

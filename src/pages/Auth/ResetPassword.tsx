import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      navigate('/login', { state: { message: 'Mot de passe mis à jour. Connectez-vous.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type="password" placeholder="Confirmer" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button type="submit">Réinitialiser</button>
    </form>
  );
}

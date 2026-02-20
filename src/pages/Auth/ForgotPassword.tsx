import { useState } from 'react';
import { api } from '../../services/api';
import { SHARED_STYLES } from '../../shared-styles';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Une erreur est survenue');
    }
  };

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div className="glass" style={{ maxWidth: 400, margin: '50px auto', padding: 32 }}>
          <h1>Mot de passe oublié</h1>
          {message && <p>{message}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              required
            />
            <button type="submit">Envoyer</button>
          </form>
        </div>
      </div>
    </>
  );
}

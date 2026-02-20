import { useState } from 'react';
import { api } from '../services/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/auth/forgot-password', { email });
    setMessage(res.data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit">Envoyer</button>
      {message && <p>{message}</p>}
    </form>
  );
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { SHARED_STYLES } from '../../shared-styles'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass" style={{ maxWidth: 400, width: '100%', padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: 'var(--accent)' }}>VYZO</h1>
            <p style={{ color: 'var(--muted)' }}>Connectez-vous à votre compte</p>
          </div>

          {error && (
            <div style={{ padding: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
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
            <div>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 40 }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center' }}>
              {loading ? <Loader2 className="spin" size={18} /> : 'Se connecter'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { SHARED_STYLES } from '../../shared-styles'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password, remember) // si votre login accepte remember
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <style>{`
        .login-card {
          animation: fadeInUp 0.6s ease;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .input-group {
          position: relative;
          transition: transform 0.2s;
        }
        .input-group:focus-within {
          transform: scale(1.02);
        }
        .input-group .icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          transition: color 0.2s;
        }
        .input-group:focus-within .icon {
          color: var(--accent);
        }
        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.2s, color 0.2s;
        }
        .toggle-password:hover {
          background: rgba(255,255,255,0.1);
          color: var(--text);
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--muted);
          cursor: pointer;
        }
        .checkbox-label input {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-radius: 5px;
          background: transparent;
          transition: all 0.2s;
          cursor: pointer;
        }
        .checkbox-label input:checked {
          background: var(--accent);
          border-color: var(--accent);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
          background-size: 12px;
          background-position: center;
          background-repeat: no-repeat;
        }
        .forgot-link {
          color: var(--accent);
          font-size: 14px;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .forgot-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
        .error-message {
          padding: 12px;
          background: rgba(248,113,113,0.1);
          border-left: 4px solid var(--danger);
          border-radius: 8px;
          color: var(--danger);
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="root" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgba(108,141,255,0.15) 0%, transparent 50%)',
      }}>
        <div className="glass login-card" style={{ 
          maxWidth: 420, 
          width: '100%', 
          padding: 40,
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: 42, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 8,
            }}>
              VYZO
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              Connectez-vous pour gérer votre activité
            </p>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Champ Email */}
            <div>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>
                Adresse email
              </label>
              <div className="input-group">
                <Mail size={18} className="icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 44, paddingRight: 12 }}
                  placeholder="exemple@email.com"
                  required
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 14, color: 'var(--muted)' }}>Mot de passe</label>
                <Link to="/forgot-password" className="forgot-link">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="input-group">
                <Lock size={18} className="icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 44, paddingRight: 40 }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton de connexion */}
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary" 
              style={{ 
                justifyContent: 'center', 
                padding: '14px',
                fontSize: 16,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="spin" size={20} style={{ marginRight: 8 }} />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien d'inscription */}
          <p style={{ 
            marginTop: 28, 
            textAlign: 'center', 
            color: 'var(--muted)', 
            fontSize: 14,
            borderTop: '1px solid var(--border)',
            paddingTop: 20,
          }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ 
              color: 'var(--accent)', 
              textDecoration: 'none',
              fontWeight: 600,
            }}>
              Créer un compte gratuitement
            </Link>
          </p>

          {/* Petit message de démonstration */}
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 16 }}>
            Démo : admin@vyzo.com / admin123
          </p>
        </div>
      </div>
    </>
  )
}

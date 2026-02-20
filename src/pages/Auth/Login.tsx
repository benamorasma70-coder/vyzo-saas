import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { SHARED_STYLES } from '../../shared-styles'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Animation d'apparition
    setLoaded(true)
  }, [])

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
      <style>{`
        /* Améliorations supplémentaires */
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 10% 20%, rgba(108, 141, 255, 0.15) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(167, 139, 250, 0.15) 0%, transparent 40%),
                      var(--bg);
          position: relative;
          overflow: hidden;
        }

        .login-root::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.2;
          pointer-events: none;
        }

        .login-card {
          max-width: 420px;
          width: 90%;
          padding: 40px 32px;
          border-radius: 32px;
          background: rgba(16, 19, 26, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transform: translateY(20px);
          opacity: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
          position: relative;
          z-index: 10;
        }

        .login-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-header p {
          color: var(--muted);
          font-size: 15px;
        }

        .error-message {
          padding: 12px 16px;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 12px;
          color: #f87171;
          font-size: 14px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(4px);
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          transition: color 0.2s;
        }

        .input-field {
          width: 100%;
          padding: 14px 14px 14px 44px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 14px;
          color: var(--text);
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }

        .input-field:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px rgba(108, 141, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
        }

        .input-field:focus + .input-icon {
          color: var(--accent);
        }

        .forgot-password {
          text-align: right;
          margin-top: 8px;
        }

        .forgot-password a {
          color: var(--muted);
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-password a:hover {
          color: var(--accent);
        }

        .login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none;
          border-radius: 14px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          margin-top: 24px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(108, 141, 255, 0.5);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .register-link {
          margin-top: 24px;
          text-align: center;
          color: var(--muted);
          font-size: 14px;
        }

        .register-link a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
          margin-left: 4px;
          transition: color 0.2s;
        }

        .register-link a:hover {
          color: var(--accent2);
          text-decoration: underline;
        }

        .spin {
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-root">
        <div className={`login-card ${loaded ? 'visible' : ''}`}>
          <div className="login-header">
            <h1>VYZO</h1>
            <p>Connectez-vous à votre compte</p>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Mot de passe</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="forgot-password">
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-button">
              {loading ? (
                <Loader2 size={20} className="spin" />
              ) : (
                <>
                  Se connecter <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="register-link">
            Pas encore de compte ?
            <Link to="/register">Créer un compte</Link>
          </div>
        </div>
      </div>
    </>
  )
}

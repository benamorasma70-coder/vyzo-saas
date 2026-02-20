// ═══════════════ Login.tsx ═══════════════
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, Loader2 } from 'lucide-react'

const AUTH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');
  :root { --accent:#6c8dff; --accent2:#a78bfa; --border:rgba(255,255,255,0.08); --muted:#6b7280; --danger:#f87171; }
  .auth-root {
    font-family:'DM Sans',sans-serif;
    min-height:100vh; background:#0d0f14;
    display:flex; align-items:center; justify-content:center; padding:24px;
    position:relative; overflow:hidden;
  }
  .auth-root::before { content:'';position:fixed;top:-250px;left:-250px;width:700px;height:700px;background:radial-gradient(circle,rgba(108,141,255,.12) 0%,transparent 70%);pointer-events:none; }
  .auth-root::after  { content:'';position:fixed;bottom:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(167,139,250,.10) 0%,transparent 70%);pointer-events:none; }
  .auth-card {
    position:relative; z-index:1;
    background:rgba(255,255,255,.045);
    border:1px solid rgba(255,255,255,.10);
    backdrop-filter:blur(24px);
    border-radius:24px;
    padding:48px 40px;
    width:100%; max-width:440px;
    box-shadow:0 32px 80px rgba(0,0,0,.5);
  }
  .auth-input {
    width:100%; background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.10); border-radius:12px;
    color:#e8eaf0; padding:12px 14px 12px 42px;
    font-family:'DM Sans',sans-serif; font-size:14px;
    outline:none; transition:border-color .2s,box-shadow .2s;
    box-sizing:border-box;
  }
  .auth-input:focus { border-color:rgba(108,141,255,.5);box-shadow:0 0 0 3px rgba(108,141,255,.12); }
  .auth-input::placeholder { color:#6b7280; }
  .auth-btn {
    width:100%; padding:13px;
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    color:#fff; border:none; border-radius:12px;
    font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600;
    cursor:pointer; transition:opacity .2s,transform .15s;
    display:flex;align-items:center;justify-content:center;gap:8px;
  }
  .auth-btn:disabled { opacity:.5; cursor:not-allowed; }
  .auth-btn:not(:disabled):hover { opacity:.9; transform:translateY(-1px); }
  .field-wrap { position:relative; }
  .field-icon { position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#6b7280;pointer-events:none; }
  .auth-label { display:block;font-size:11px;font-weight:600;letter-spacing:.7px;text-transform:uppercase;color:#6b7280;margin-bottom:8px; }
  .auth-err { padding:12px 16px;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);border-radius:10px;color:#f87171;font-size:13px;margin-bottom:20px; }
  .auth-link { color:var(--accent);text-decoration:none;font-weight:600; }
  .auth-link:hover { text-decoration:underline; }
`

export function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/') }
    catch (err: any) { setError(err.response?.data?.error || 'Erreur de connexion') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <div className="auth-root">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, background: 'linear-gradient(90deg,#6c8dff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>VYZO</h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Connectez-vous à votre compte</p>
          </div>

          {error && <div className="auth-err">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label className="auth-label">Email</label>
              <div className="field-wrap">
                <Mail size={16} className="field-icon" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" placeholder="votre@email.com" required />
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <label className="auth-label">Mot de passe</label>
              <div className="field-wrap">
                <Lock size={16} className="field-icon" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin .7s linear infinite' }} /> : 'Se connecter'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            Pas encore de compte ?{' '}<Link to="/register" className="auth-link">Créer un compte</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}


// ═══════════════ Register.tsx ═══════════════
// (exported separately below for file splitting)

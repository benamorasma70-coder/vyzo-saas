import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, Building, Phone, FileText, Loader2 } from 'lucide-react'
import { SHARED_STYLES } from '../../shared-styles'

export function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    rcNumber: '',
    ai: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        phone: formData.phone,
        rcNumber: formData.rcNumber,
        ai: formData.ai,
      })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass" style={{ maxWidth: 600, width: '100%', padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: 'var(--accent)' }}>VYZO</h1>
            <p style={{ color: 'var(--muted)' }}>Créez votre compte gratuitement</p>
            <p style={{ color: 'var(--success)', marginTop: 8 }}>1 mois gratuit inclus !</p>
          </div>

          {error && (
            <div style={{ padding: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Email *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Nom de l'entreprise *</label>
                <div style={{ position: 'relative' }}>
                  <Building size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Mot de passe *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Confirmer le mot de passe *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Téléphone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Registre de commerce</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="text"
                    name="rcNumber"
                    value={formData.rcNumber}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Matricule fiscale</label>
                <input
                  type="text"
                  name="ai"
                  value={formData.ai}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 24, justifyContent: 'center' }}>
              {loading ? <Loader2 className="spin" size={18} /> : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

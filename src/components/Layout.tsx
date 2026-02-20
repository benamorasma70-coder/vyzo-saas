import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Package, FileText, FileSpreadsheet, Truck,
  CreditCard, LogOut, Menu, X, LayoutDashboard, ShieldCheck
} from 'lucide-react';

const LAYOUT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');

  :root {
    --bg:       #0d0f14;
    --sidebar:  #10131a;
    --surface:  rgba(255,255,255,0.045);
    --border:   rgba(255,255,255,0.08);
    --accent:   #6c8dff;
    --accent2:  #a78bfa;
    --text:     #e8eaf0;
    --muted:    #6b7280;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .layout-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    color: var(--text);
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: var(--sidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0;
    z-index: 40;
    transition: transform .3s ease;
  }
  .sidebar.closed { transform: translateX(-100%); }

  /* Logo */
  .sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--border);
  }
  .logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -.5px;
  }
  .logo-sub {
    font-size: 11px; font-weight: 500; letter-spacing: .8px;
    text-transform: uppercase; color: var(--muted); margin-top: 2px;
  }

  /* Nav links */
  .nav-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: var(--muted);
    padding: 20px 24px 8px;
  }
  .nav-link {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 24px;
    font-size: 13.5px; font-weight: 500;
    color: var(--muted);
    text-decoration: none;
    border-left: 3px solid transparent;
    transition: color .2s, background .2s, border-color .2s;
    position: relative;
  }
  .nav-link:hover {
    color: var(--text);
    background: rgba(255,255,255,.04);
  }
  .nav-link.active {
    color: var(--accent);
    background: rgba(108,141,255,.08);
    border-left-color: var(--accent);
    font-weight: 600;
  }
  .nav-link svg { flex-shrink: 0; }

  /* Sidebar footer */
  .sidebar-footer {
    margin-top: auto;
    border-top: 1px solid var(--border);
    padding: 20px 24px;
  }
  .user-pill {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px;
  }
  .user-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .user-name {
    font-size: 13px; font-weight: 600; color: var(--text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .user-role { font-size: 11px; color: var(--muted); }

  .logout-btn {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 8px 10px;
    background: rgba(248,113,113,.08);
    border: 1px solid rgba(248,113,113,.18);
    border-radius: 10px;
    color: #f87171; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    cursor: pointer; transition: background .2s;
    text-align: left;
  }
  .logout-btn:hover { background: rgba(248,113,113,.15); }

  /* ── Main content ── */
  .main-wrapper {
    flex: 1;
    margin-left: 240px;
    min-height: 100vh;
    display: flex; flex-direction: column;
    transition: margin-left .3s ease;
  }
  .main-wrapper.full { margin-left: 0; }

  /* Topbar (mobile only) */
  .topbar {
    display: none;
    align-items: center; justify-content: space-between;
    padding: 16px 20px;
    background: var(--sidebar);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 30;
  }

  .hamburger {
    background: rgba(255,255,255,.06); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px; color: var(--text);
    cursor: pointer; display: flex; transition: background .2s;
  }
  .hamburger:hover { background: rgba(255,255,255,.12); }

  /* Mobile overlay */
  .sidebar-overlay {
    display: none;
    position: fixed; inset: 0; z-index: 35;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(3px);
  }
  .sidebar-overlay.visible { display: block; }

  /* Subscription expiry banner */
  .expiry-banner {
    margin: 16px 20px 0;
    padding: 10px 16px;
    border-radius: 10px;
    background: rgba(251,191,36,.08);
    border: 1px solid rgba(251,191,36,.25);
    font-size: 12px; color: #fbbf24; font-weight: 500;
  }

  .page-content {
    padding: 32px 28px;
    flex: 1;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main-wrapper { margin-left: 0; }
    .topbar { display: flex; }
    .page-content { padding: 20px 16px; }
  }
`;

const NAV_LINKS = [
  { to: '/',            label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/customers',   label: 'Clients',            icon: Users },
  { to: '/products',    label: 'Produits',           icon: Package },
  { to: '/invoices',    label: 'Factures',           icon: FileText },
  { to: '/quotes',      label: 'Devis',              icon: FileSpreadsheet },
  { to: '/deliveries',  label: 'Bons de livraison',  icon: Truck },
];

export function Layout() {
  const { user, subscription, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const initials = user?.companyName?.slice(0, 2).toUpperCase() || 'VZ';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <style>{LAYOUT_STYLES}</style>

      <div className="layout-root">

        {/* ── Sidebar overlay (mobile) ── */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={closeSidebar}
        />

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-text">VYZO</div>
            <div className="logo-sub">Gestion commerciale</div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, paddingTop: 8 }}>
            <div className="nav-section-label">Navigation</div>
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${isActive(to) ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}

            {/* Abonnement */}
            <div className="nav-section-label" style={{ marginTop: 8 }}>Compte</div>
            <Link
              to="/subscription"
              className={`nav-link ${isActive('/subscription') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <CreditCard size={17} />
              Abonnement
              {subscription && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 99,
                  background: 'rgba(108,141,255,.15)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(108,141,255,.3)',
                  letterSpacing: '.3px',
                }}>
                  {subscription.display_name}
                </span>
              )}
            </Link>

            {/* Admin */}
            {user?.is_admin && (
              <>
                <div className="nav-section-label" style={{ marginTop: 8 }}>Admin</div>
                <Link
                  to="/admin"
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <ShieldCheck size={17} />
                  Administration
                </Link>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="user-pill">
              <div className="user-avatar">{initials}</div>
              <div style={{ overflow: 'hidden' }}>
                <div className="user-name">{user?.companyName}</div>
                <div className="user-role">{user?.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main-wrapper">

          {/* Topbar mobile */}
          <header className="topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VYZO
            </span>
            <div style={{ width: 36 }} /> {/* spacer */}
          </header>

          {/* Expiry warning */}
          {subscription?.expires_soon && (
            <div className="expiry-banner">
              ⚡ Votre abonnement <strong>{subscription.display_name}</strong> expire dans{' '}
              <strong>{subscription.days_remaining} jours</strong> —{' '}
              <Link to="/subscription" style={{ color: '#fbbf24', textDecoration: 'underline' }}>
                Renouveler
              </Link>
            </div>
          )}

          {/* Page content */}
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

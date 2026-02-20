export const SHARED_STYLES = `
  :root {
    --bg:       #0d0f14;
    --surface:  rgba(255,255,255,0.045);
    --border:   rgba(255,255,255,0.08);
    --accent:   #6c8dff;
    --accent2:  #a78bfa;
    --text:     #e8eaf0;
    --muted:    #6b7280;
    --success:  #34d399;
    --danger:   #f87171;
    --warning:  #fbbf24;
  }

  .root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding: 40px 24px;
    position: relative;
    z-index: 1;
  }
  .root::before {
    content: '';
    position: fixed;
    top: -200px; left: -200px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(108,141,255,.10) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .root::after {
    content: '';
    position: fixed;
    bottom: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(167,139,250,.08) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .glass {
    background: var(--surface);
    border: 1px solid var(--border);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: 16px;
  }

  .input {
    background: rgba(255,255,255,.05);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .input:focus {
    border-color: rgba(108,141,255,.5);
    box-shadow: 0 0 0 3px rgba(108,141,255,.12);
  }
  .input::placeholder { color: var(--muted); }
  .input option { background: #1e1e2e; color: #fff; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: opacity .2s, transform .15s;
  }
  .btn-primary:hover { opacity: .9; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    background: rgba(255,255,255,.06);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }
  .btn-ghost:hover { background: rgba(255,255,255,.10); border-color: rgba(255,255,255,.16); }
  .btn-ghost:disabled { opacity: .5; cursor: not-allowed; }

  .table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
  }
  .table thead th {
    padding: 14px 20px;
    font-size: 11px; font-weight: 600;
    letter-spacing: .8px; text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
    text-align: left;
  }
  .table thead th.right { text-align: right; }
  .table thead th.center { text-align: center; }

  .table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,.04);
    transition: background .15s;
  }
  .table tbody tr:hover { background: rgba(255,255,255,.04); }

  .table td {
    padding: 14px 20px;
    font-size: 14px;
    color: var(--text);
  }
  .table td.right { text-align: right; }
  .table td.center { text-align: center; }

  .status-pill {
    display: inline-block;
    padding: 3px 11px;
    border-radius: 99px;
    font-size: 11px; font-weight: 600;
    letter-spacing: .3px;
  }

  .icon-btn {
    background: none; border: none;
    cursor: pointer; padding: 6px;
    border-radius: 8px;
    transition: background .15s, color .15s;
    color: var(--muted);
    display: inline-flex; align-items: center;
  }
  .icon-btn:hover { background: rgba(255,255,255,.08); color: var(--text); }
  .icon-btn.blue:hover  { color: var(--accent); }
  .icon-btn.green:hover { color: var(--success); }
  .icon-btn.orange:hover { color: var(--warning); }
  .icon-btn.red:hover { color: var(--danger); }

  .fade-up {
    opacity: 0; transform: translateY(16px);
    transition: opacity .5s ease, transform .5s ease;
  }
  .fade-up.show { opacity: 1; transform: translateY(0); }
  .delay-1 { transition-delay: .05s; }
  .delay-2 { transition-delay: .12s; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .loader {
    width:36px;height:36px;
    border:3px solid rgba(108,141,255,.2);
    border-top-color:#6c8dff;
    border-radius:50%;
    animation:spin .7s linear infinite;
  }

  /* Pour les modales */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
  }
  .modal-content {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 24px;
    max-width: 42rem;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  .modal-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
  }
  .modal-close {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: all .2s;
  }
  .modal-close:hover {
    background: rgba(255,255,255,.1);
    color: var(--text);
  }
  .modal-body {
    padding: 1.5rem;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid var(--border);
  }

  /* Cards (pour abonnements) */
  .plan-card {
    background: var(--surface);
    border: 1px solid var(--border);
    backdrop-filter: blur(12px);
    border-radius: 24px;
    padding: 2rem;
    transition: all 0.2s;
  }
  .plan-card:hover {
    transform: translateY(-4px);
    border-color: rgba(108,141,255,0.3);
    box-shadow: 0 12px 30px rgba(0,0,0,0.5);
  }
  .plan-card.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(108,141,255,0.2);
  }
`;

// src/pages/Quotes/shared-styles.ts

// CSS string injected via <style> tag – includes all custom classes used in Quotes.tsx
export const BASE_STYLES = `
  /* Base layout & animations */
  .page-root {
    min-height: 100vh;
    padding: 40px 24px;
    background: #0d0f14;
    color: #e1e4e8;
    font-family: 'Inter', sans-serif;
  }

  .glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  .fade-up {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .fade-up.show {
    opacity: 1;
    transform: translateY(0);
  }
  .d1 { transition-delay: 0.1s; }

  /* Form elements */
  .f-input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 14px;
    color: #e1e4e8;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .f-input:focus {
    border-color: #6c8dff;
    box-shadow: 0 0 0 3px rgba(108, 141, 255, 0.2);
  }

  /* Buttons */
  .btn-primary {
    background: #6c8dff;
    border: none;
    border-radius: 12px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }
  .btn-primary:hover {
    background: #5a7ae0;
  }
  .btn-primary:active {
    transform: scale(0.98);
  }

  .icon-btn {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 8px;
    color: #e1e4e8;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 4px;
  }
  .icon-btn.blue:hover { background: rgba(88, 166, 255, 0.2); color: #58a6ff; }
  .icon-btn.orange:hover { background: rgba(247, 129, 102, 0.2); color: #f78166; }
  .icon-btn.green:hover { background: rgba(63, 185, 80, 0.2); color: #3fb950; }
  .icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Table */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .data-table th {
    text-align: left;
    padding: 16px 12px;
    color: #8b949e;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .data-table td {
    padding: 16px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }
  .data-table tr:last-child td {
    border-bottom: none;
  }
  .data-table .right {
    text-align: right;
  }
  .data-table .center {
    text-align: center;
  }

  .ref-badge {
    background: rgba(108, 141, 255, 0.1);
    color: #6c8dff;
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Monaco', monospace;
  }

  .status-pill {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 30px;
    font-size: 12px;
    font-weight: 600;
  }

  .spin {
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Status mapping for quotes
export const STATUS_QUOTE: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Brouillon', color: '#8b949e', bg: 'rgba(139,148,158,0.1)' },
  sent:      { label: 'Envoyé',    color: '#58a6ff', bg: 'rgba(88,166,255,0.1)' },
  accepted:  { label: 'Accepté',   color: '#3fb950', bg: 'rgba(63,185,80,0.1)' },
  expired:   { label: 'Expiré',    color: '#f78166', bg: 'rgba(247,129,102,0.1)' },
  rejected:  { label: 'Rejeté',    color: '#f85149', bg: 'rgba(248,81,73,0.1)' },
  converted: { label: 'Converti',  color: '#a371f7', bg: 'rgba(163,113,247,0.1)' },
};

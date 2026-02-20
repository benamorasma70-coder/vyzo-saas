import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Plus, Search, Eye, FileText, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SHARED_STYLES } from '../../shared-styles'

const STATUS_DELIVERY: Record<string, { label: string; color: string; bg: string }> = {
  draft:    { label: 'Brouillon', color: '#9ca3af', bg: 'rgba(156,163,175,.12)' },
  delivered:{ label: 'Livré',     color: '#34d399', bg: 'rgba(52,211,153,.12)' },
  invoiced: { label: 'Facturé',   color: '#a78bfa', bg: 'rgba(167,139,250,.12)' },
}

export function Deliveries() {
  // ... mêmes hooks et fonctions que précédemment, mais adaptés

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header identique à Quotes mais avec "Bons de livraison" */}
          <div className={`fade-up ${loaded ? 'show' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}>Bons de livraison</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{filtered.length} BL</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input className="input" style={{ paddingLeft: 36, width: 240 }} placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => navigate('/deliveries/new')}>
                <Plus size={16} /> Nouveau BL
              </button>
            </div>
          </div>

          {/* Tableau */}
          <div className={`glass fade-up delay-1 ${loaded ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>N° BL</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th className="right">Total</th>
                    <th className="center">Statut</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => {
                    const s = STATUS_DELIVERY[d.status] ?? STATUS_DELIVERY.draft
                    return (
                      <tr key={d.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', background: 'rgba(108,141,255,.1)', padding: '3px 8px', borderRadius: 6 }}>{d.delivery_number}</span></td>
                        <td>{d.customer_name}</td>
                        <td style={{ color: 'var(--muted)' }}>{d.delivery_date}</td>
                        <td className="right" style={{ fontWeight: 700 }}>{d.total.toLocaleString()} DZD</td>
                        <td className="center"><span className="status-pill" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                        <td className="right">
                          <button className="icon-btn blue" onClick={() => navigate(`/deliveries/${d.id}`)}><Eye size={16} /></button>
                          <button className="icon-btn orange" onClick={() => handleDownloadPdf(d.id, d.delivery_number)} disabled={downloadingId === d.id}>
                            {downloadingId === d.id ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { SHARED_STYLES } from '../../shared-styles'

export function QuoteForm() {
  // États et fonctions identiques (non reproduits ici pour la brièveté)

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="root">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <button onClick={() => navigate('/quotes')} className="btn-ghost" style={{ marginBottom: 24 }}>
            <ArrowLeft size={16} /> Retour
          </button>

          <div className="glass" style={{ padding: 24 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Nouveau Devis</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Client et dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Client</label>
                  <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="input" required>
                    <option value="">Sélectionner un client</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.company_name || c.contact_name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Date d'émission</label>
                    <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="input" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Date d'expiration</label>
                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="input" />
                  </div>
                </div>
              </div>

              {/* Articles */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={{ fontWeight: 600 }}>Articles</h2>
                  <button type="button" onClick={addItem} className="btn-ghost" style={{ padding: '6px 12px' }}>
                    <Plus size={16} /> Ajouter
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ minWidth: 700 }}>
                    <thead>
                      <tr>
                        <th>Produit / Description</th>
                        <th className="right">Qté</th>
                        <th className="right">P.U HT</th>
                        <th className="right">TVA %</th>
                        <th className="right">Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <select
                                value={item.productId || ''}
                                onChange={e => handleProductSelect(idx, e.target.value)}
                                className="input"
                                style={{ width: 140 }}
                              >
                                <option value="">Manuel</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                              <input
                                type="text"
                                value={item.description}
                                onChange={e => updateItem(idx, 'description', e.target.value)}
                                className="input"
                                placeholder="Description"
                                required
                              />
                            </div>
                          </td>
                          <td className="right">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))}
                              className="input"
                              style={{ width: 70, textAlign: 'right' }}
                              min="1"
                              required
                            />
                          </td>
                          <td className="right">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                              className="input"
                              style={{ width: 90, textAlign: 'right' }}
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td className="right">
                            <input
                              type="number"
                              value={item.taxRate}
                              onChange={e => updateItem(idx, 'taxRate', parseFloat(e.target.value))}
                              className="input"
                              style={{ width: 70, textAlign: 'right' }}
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </td>
                          <td className="right" style={{ fontWeight: 600 }}>
                            {(item.quantity * item.unitPrice * (1 + (item.taxRate||0)/100)).toFixed(2)} DZD
                          </td>
                          <td className="right">
                            {items.length > 1 && (
                              <button type="button" onClick={() => removeItem(idx)} className="icon-btn" style={{ color: 'var(--danger)' }}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totaux */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 280 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
                    <span>Total HT :</span>
                    <span>{totals.subtotal.toFixed(2)} DZD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                    <span>Total TVA :</span>
                    <span>{totals.taxTotal.toFixed(2)} DZD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                    <span>Total TTC :</span>
                    <span>{totals.total.toFixed(2)} DZD</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input" rows={3} placeholder="Conditions, notes particulières..." />
              </div>

              {/* Boutons d'action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => navigate('/quotes')} className="btn-ghost">Annuler</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Création...' : 'Créer le devis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

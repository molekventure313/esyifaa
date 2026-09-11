'use client';

import { useState, useEffect, useCallback } from 'react';

const FF = 'var(--font-inter), -apple-system, sans-serif';
const GREEN = '#10B981';
const CARD = '#10131A';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#F9FAFB';
const MUTED = '#9CA3AF';

const MOVE_TYPE_CONFIG = {
  in:         { label: '✅ Masuk',   color: '#10B981', bg: 'rgba(16,185,129,0.1)',   sign: '+' },
  out:        { label: '📦 Keluar',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   sign: '-' },
  return:     { label: '🔄 Return',  color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',   sign: '+' },
  adjustment: { label: '⚙️ Adjust', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)',  sign: '±' },
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      background: type === 'success' ? '#065F46' : '#7F1D1D',
      border: `1px solid ${type === 'success' ? '#34D399' : '#F87171'}`,
      color: '#fff', borderRadius: '10px', padding: '0.85rem 1.25rem',
      fontSize: '0.875rem', fontWeight: 600, fontFamily: FF,
      boxShadow: '0 8px 25px rgba(0,0,0,0.4)', maxWidth: '340px',
    }}>
      {type === 'success' ? '✅ ' : '❌ '}{msg}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', background: '#090A0F',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
  color: TEXT, fontSize: '0.875rem', fontFamily: FF, outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: MUTED, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const btnPrimary = { padding: '0.6rem 1.25rem', background: '#059669', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: FF };
const btnGhost   = { padding: '0.6rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: MUTED, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: FF };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatRM(v) { return v != null ? `RM ${parseFloat(v).toFixed(2)}` : '—'; }

// ─── Add Stock Modal ──────────────────────────────────────────────────────────
function AddStockModal({ products, onClose, onSuccess }) {
  const [form, setForm] = useState({ product_id: products[0]?.id || '', qty: '', cost_per_unit: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const total = (parseFloat(form.qty) || 0) * (parseFloat(form.cost_per_unit) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const res = await fetch('/api/stock/add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, qty: parseInt(form.qty), cost_per_unit: parseFloat(form.cost_per_unit) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onSuccess();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '1rem' }}>
      <div style={{ background: '#161B27', border: `2px solid ${GREEN}`, borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '480px', fontFamily: FF }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 800, color: TEXT }}>📦 Tambah Stok Baru</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Produk</label>
            <select style={inputStyle} value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Kuantiti (unit)</label>
              <input style={inputStyle} type="number" min="1" placeholder="Cth: 50" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} required />
            </div>
            <div>
              <label style={labelStyle}>Kos Seunit (RM)</label>
              <input style={inputStyle} type="number" min="0" step="0.01" placeholder="Cth: 15.00" value={form.cost_per_unit} onChange={e => setForm(f => ({ ...f, cost_per_unit: e.target.value }))} required />
            </div>
          </div>
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#090A0F', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: MUTED }}>Total Kos Batch</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: GREEN }}>{formatRM(total)}</span>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Nota (pilihan)</label>
            <input style={inputStyle} type="text" placeholder="Cth: Batch Sep 2026 dari pembekal X" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          {err && <p style={{ color: '#F87171', fontSize: '0.82rem', margin: '0 0 1rem' }}>❌ {err}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" style={btnPrimary} disabled={loading}>{loading ? 'Menyimpan...' : '✓ Tambah Stok'}</button>
            <button type="button" style={btnGhost} onClick={onClose}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Product Modal ────────────────────────────────────────────────────────
function AddProductModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', sku: '', unit: 'unit', cost_price: '', selling_price: '', low_stock_threshold: '10' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const res = await fetch('/api/stock/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onSuccess();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '1rem' }}>
      <div style={{ background: '#161B27', border: '2px solid #60A5FA', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '520px', fontFamily: FF }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 800, color: TEXT }}>➕ Tambah Produk Baru</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nama Produk *</label>
              <input style={inputStyle} type="text" placeholder="Cth: Sabun Garam Himalaya 200g" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label style={labelStyle}>SKU *</label>
              <input style={inputStyle} type="text" placeholder="Cth: SGH-200G" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} required />
            </div>
            <div>
              <label style={labelStyle}>Unit</label>
              <input style={inputStyle} type="text" placeholder="unit / kotak / botol" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Kos Seunit (RM)</label>
              <input style={inputStyle} type="number" min="0" step="0.01" placeholder="0.00" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Harga Jual (RM)</label>
              <input style={inputStyle} type="number" min="0" step="0.01" placeholder="0.00" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Alert Stok Rendah (unit)</label>
              <input style={inputStyle} type="number" min="1" placeholder="10" value={form.low_stock_threshold} onChange={e => setForm(f => ({ ...f, low_stock_threshold: e.target.value }))} />
            </div>
          </div>
          {err && <p style={{ color: '#F87171', fontSize: '0.82rem', margin: '0 0 1rem' }}>❌ {err}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" style={{ ...btnPrimary, background: '#2563EB' }} disabled={loading}>{loading ? 'Menyimpan...' : '✓ Tambah Produk'}</button>
            <button type="button" style={btnGhost} onClick={onClose}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StokPage() {
  const [activeTab,  setActiveTab]  = useState('stok');
  const [summary,    setSummary]    = useState(null);
  const [products,   setProducts]   = useState([]);
  const [movements,  setMovements]  = useState([]);
  const [totalMoves, setTotalMoves] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);

  const [showAddStock,   setShowAddStock]   = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm,       setEditForm]       = useState({});
  const [saving,         setSaving]         = useState(false);

  const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, prodRes, moveRes] = await Promise.all([
        fetch('/api/stock/summary').then(r => r.json()),
        fetch('/api/stock/products').then(r => r.json()),
        fetch('/api/stock/movements?limit=50').then(r => r.json()),
      ]);
      if (sumRes.success)  setSummary(sumRes.data);
      if (prodRes.success) setProducts(prodRes.data || []);
      if (moveRes.success) { setMovements(moveRes.data || []); setTotalMoves(moveRes.total || 0); }
    } catch (e) { showToast('Gagal memuatkan data stok', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/stock/products', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProduct, ...editForm }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast('Produk berjaya dikemaskini');
      setEditingProduct(null);
      fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const mainProduct = summary?.products?.[0];
  const allActiveProducts = products.filter(p => p.is_active);

  return (
    <div style={{ fontFamily: FF, color: TEXT }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showAddStock   && <AddStockModal products={allActiveProducts} onClose={() => setShowAddStock(false)}   onSuccess={() => { setShowAddStock(false);   showToast(`Stok berjaya ditambah!`); fetchAll(); }} />}
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} onSuccess={() => { setShowAddProduct(false); showToast('Produk baru berjaya ditambah!'); fetchAll(); }} />}

      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem', background: CARD, border: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            📦 PENGURUSAN STOK
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Stok Produk Fizikal</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: MUTED }}>Auto-deduct setiap order · COD Return · Sejarah pergerakan</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAddProduct(true)} style={{ ...btnGhost, fontSize: '0.82rem' }}>+ Tambah Produk</button>
          <button onClick={() => setShowAddStock(true)}   style={{ ...btnPrimary }}>+ Tambah Stok</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#090A0F', padding: '3px', borderRadius: '8px', width: 'fit-content', border: `1px solid ${BORDER}` }}>
        {[{ id: 'stok', label: '📦 Stok & Sejarah' }, { id: 'produk', label: '🛍️ Produk' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '0.45rem 1.1rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '0.82rem', fontFamily: FF,
            background: activeTab === tab.id ? '#064E3B' : 'transparent',
            color: activeTab === tab.id ? '#34D399' : MUTED,
          }}>{tab.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '250px', gap: '0.75rem', flexDirection: 'column' }}>
          <div className="spinner" style={{ width: '28px', height: '28px', borderColor: 'rgba(16,185,129,0.2)', borderTopColor: GREEN }} />
          <span style={{ color: MUTED, fontSize: '0.85rem' }}>Memuatkan data stok...</span>
        </div>
      ) : activeTab === 'stok' ? (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {(summary?.products || []).map(p => (
              <div key={p.id}>
                {/* Stock qty card */}
                <div style={{
                  padding: '1.25rem', borderRadius: '10px', marginBottom: '0.75rem',
                  background: p.is_out_of_stock ? 'rgba(239,68,68,0.1)' : p.is_low_stock ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.08)',
                  border: `1px solid ${p.is_out_of_stock ? 'rgba(239,68,68,0.3)' : p.is_low_stock ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.2)'}`,
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{p.name}</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, color: p.is_out_of_stock ? '#EF4444' : p.is_low_stock ? '#F59E0B' : GREEN }}>
                    {p.current_stock}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: '0.3rem' }}>{p.unit} tersedia</div>
                  {p.is_low_stock && !p.is_out_of_stock && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#F59E0B', fontWeight: 700 }}>⚠️ Stok rendah (alert: {p.low_stock_threshold})</div>
                  )}
                  {p.is_out_of_stock && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#EF4444', fontWeight: 700 }}>🚫 Stok habis!</div>
                  )}
                </div>
              </div>
            ))}

            {/* Value card */}
            <div style={{ padding: '1.25rem', borderRadius: '10px', background: CARD, border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', marginBottom: '0.4rem' }}>💰 Nilai Stok</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34D399' }}>{formatRM(summary?.total_value)}</div>
              <div style={{ fontSize: '0.75rem', color: MUTED, marginTop: '0.3rem' }}>Jumlah keseluruhan</div>
            </div>

            {/* Avg cost card */}
            {summary?.products?.[0] && (
              <div style={{ padding: '1.25rem', borderRadius: '10px', background: CARD, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', marginBottom: '0.4rem' }}>💲 Kos Seunit</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: TEXT }}>{formatRM(summary.products[0].avg_cost_per_unit || summary.products[0].cost_price)}</div>
                <div style={{ fontSize: '0.75rem', color: MUTED, marginTop: '0.3rem' }}>Weighted average</div>
              </div>
            )}
          </div>

          {/* Movement history */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>📊 Sejarah Pergerakan Stok</h2>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: MUTED }}>{totalMoves} rekod keseluruhan</p>
              </div>
            </div>

            {movements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: MUTED }}>Tiada pergerakan stok lagi.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {['Tarikh', 'Produk', 'Jenis', 'Qty', 'Kos/Unit', 'Rujukan', 'Nota'].map(h => (
                        <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map(m => {
                      const cfg = MOVE_TYPE_CONFIG[m.movement_type] || MOVE_TYPE_CONFIG.in;
                      return (
                        <tr key={m.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                          <td style={{ padding: '0.65rem 0.75rem', color: MUTED, whiteSpace: 'nowrap' }}>{formatDate(m.created_at)}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: TEXT, fontWeight: 600 }}>{m.products?.sku || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: cfg.color }}>
                            {cfg.sign}{m.qty} {m.products?.unit || 'unit'}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: MUTED }}>{m.cost_per_unit ? formatRM(m.cost_per_unit) : '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: MUTED, fontSize: '0.72rem' }}>
                            {m.reference_type === 'order' ? `📦 ${m.reference_id?.slice(0, 8)}...` : m.reference_type || '—'}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: MUTED, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── Tab Produk ── */
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>🛍️ Senarai Produk</h2>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: MUTED }}>{products.length} produk didaftarkan</p>
            </div>
            <button onClick={() => setShowAddProduct(true)} style={{ ...btnPrimary, background: '#2563EB' }}>+ Tambah Produk</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#090A0F', borderRadius: '10px', border: editingProduct === p.id ? '1px solid #34D399' : `1px solid ${BORDER}`, overflow: 'hidden' }}>
                {editingProduct === p.id ? (
                  <div style={{ padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#34D399' }}>✏️ Edit: {p.name}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Nama Produk</label>
                        <input style={inputStyle} value={editForm.name ?? p.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label style={labelStyle}>Kos Seunit (RM) ★</label>
                        <input style={{ ...inputStyle, borderColor: '#34D399' }} type="number" min="0" step="0.01" value={editForm.cost_price ?? p.cost_price} onChange={e => setEditForm(f => ({ ...f, cost_price: e.target.value }))} />
                      </div>
                      <div>
                        <label style={labelStyle}>Harga Jual (RM)</label>
                        <input style={inputStyle} type="number" min="0" step="0.01" value={editForm.selling_price ?? p.selling_price} onChange={e => setEditForm(f => ({ ...f, selling_price: e.target.value }))} />
                      </div>
                      <div>
                        <label style={labelStyle}>Alert Stok (unit)</label>
                        <input style={inputStyle} type="number" min="1" value={editForm.low_stock_threshold ?? p.low_stock_threshold} onChange={e => setEditForm(f => ({ ...f, low_stock_threshold: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button style={btnPrimary} onClick={handleSaveProduct} disabled={saving}>{saving ? 'Menyimpan...' : '✓ Simpan'}</button>
                      <button style={btnGhost} onClick={() => { setEditingProduct(null); setEditForm({}); }}>Batal</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 700, color: TEXT, marginBottom: '0.2rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: MUTED, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span>SKU: <strong style={{ color: TEXT }}>{p.sku}</strong></span>
                        <span>Unit: {p.unit}</span>
                        <span>Alert: {p.low_stock_threshold} unit</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Kos Seunit</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: p.cost_price > 0 ? '#F59E0B' : '#EF4444' }}>
                          {p.cost_price > 0 ? formatRM(p.cost_price) : '⚠️ Belum diisi'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Harga Jual</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: TEXT }}>{formatRM(p.selling_price)}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', background: p.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: p.is_active ? '#34D399' : MUTED }}>
                        {p.is_active ? '✅ Aktif' : '🚫 Nyahaktif'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ ...btnGhost, fontSize: '0.78rem', padding: '0.4rem 0.8rem' }} onClick={() => { setEditingProduct(p.id); setEditForm({}); }}>✏️ Edit</button>
                      <button
                        style={{ ...btnGhost, fontSize: '0.78rem', padding: '0.4rem 0.8rem', color: p.is_active ? '#EF4444' : '#34D399' }}
                        onClick={async () => {
                          await fetch('/api/stock/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, is_active: !p.is_active }) });
                          fetchAll();
                        }}
                      >
                        {p.is_active ? 'Nyahaktif' : 'Aktifkan'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {products.length === 0 && <div style={{ textAlign: 'center', padding: '2.5rem', color: MUTED }}>Tiada produk lagi. Tambah produk pertama anda.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

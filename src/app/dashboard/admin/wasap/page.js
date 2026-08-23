'use client';

import { useState, useEffect, useCallback } from 'react';

const FF = 'var(--font-inter), -apple-system, sans-serif';
const GREEN = '#34D399';
const BG = '#10131A';
const CARD = '#161B27';
const BORDER = 'rgba(255,255,255,0.08)';

// ─── Toast (inline, no import needed) ────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      background: type === 'success' ? '#065F46' : '#7F1D1D',
      border: `1px solid ${type === 'success' ? '#34D399' : '#F87171'}`,
      color: '#fff', borderRadius: '10px', padding: '0.85rem 1.25rem',
      fontSize: '0.875rem', fontWeight: 600, fontFamily: FF,
      boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
      maxWidth: '320px', lineHeight: 1.45,
    }}>
      {type === 'success' ? '✅ ' : '❌ '}{msg}
    </div>
  );
}

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = () => ({ name: '', number: '', is_active: true, sort_order: 0 });

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WasapSettingsPage() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm());
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNumbers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/wasap');
      const json = await res.json();
      if (json.success) setNumbers(json.data || []);
      else showToast(json.error || 'Gagal memuatkan', 'error');
    } catch {
      showToast('Ralat sambungan', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchNumbers(); }, [fetchNumbers]);

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('/api/settings/wasap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Nombor berjaya ditambah!');
        setAddForm(emptyForm());
        setShowAddForm(false);
        fetchNumbers();
      } else {
        showToast(json.error || 'Gagal menambah nombor', 'error');
      }
    } catch {
      showToast('Ralat semasa menambah', 'error');
    } finally {
      setAdding(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, number: item.number, sort_order: item.sort_order });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/wasap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Nombor berjaya dikemas kini!');
        setEditingId(null);
        fetchNumbers();
      } else {
        showToast(json.error || 'Gagal mengemaskini', 'error');
      }
    } catch {
      showToast('Ralat semasa menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Active ──────────────────────────────────────────────────────────
  const handleToggle = async (item) => {
    setTogglingId(item.id);
    try {
      const res = await fetch('/api/settings/wasap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(item.is_active ? 'Nombor dinyahaktifkan.' : 'Nombor diaktifkan!');
        fetchNumbers();
      } else {
        showToast(json.error || 'Gagal tukar status', 'error');
      }
    } catch {
      showToast('Ralat semasa toggle', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Padam nombor ini? Tindakan ini tidak boleh dibatalkan.')) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/settings/wasap', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Nombor berjaya dipadam.');
        fetchNumbers();
      } else {
        showToast(json.error || 'Gagal memadam', 'error');
      }
    } catch {
      showToast('Ralat semasa memadam', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Input style helper ─────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '0.6rem 0.85rem',
    background: '#0D111C', border: `1px solid ${BORDER}`,
    borderRadius: '8px', color: '#F1F5F9',
    fontSize: '0.875rem', fontFamily: FF, outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 700,
    color: '#94A3B8', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: '0.35rem',
  };

  const btnStyle = (variant = 'primary') => ({
    padding: '0.55rem 1.1rem', borderRadius: '8px',
    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
    border: 'none', fontFamily: FF,
    background: variant === 'primary' ? GREEN
      : variant === 'danger' ? 'rgba(239,68,68,0.15)'
      : 'rgba(255,255,255,0.07)',
    color: variant === 'primary' ? '#042E23'
      : variant === 'danger' ? '#F87171'
      : '#CBD5E1',
    border: variant === 'danger' ? '1px solid rgba(239,68,68,0.3)'
      : variant === 'ghost' ? `1px solid ${BORDER}` : 'none',
  });

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FF, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💬</span>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#F1F5F9' }}>
              Nombor WhatsApp Perawat
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6 }}>
            Nombor-nombor di bawah digunakan untuk auto-rotate di halaman{' '}
            <code style={{ background: '#1E293B', padding: '0.1rem 0.4rem', borderRadius: '4px', color: GREEN, fontSize: '0.8rem' }}>/wa</code>.
            Setiap kunjungan baru, pelawat akan diarahkan ke perawat yang berbeza secara bergilir.
          </p>
        </div>

        {/* Info callout */}
        <div style={{
          background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)',
          borderLeft: `4px solid ${GREEN}`, borderRadius: '10px',
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>ℹ️</span>
          <div>
            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.82rem', color: '#A7F3D0', fontWeight: 700 }}>
              Cara Rotation Berfungsi
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6EE7B7', lineHeight: 1.6 }}>
              Kunjungan 1 → Perawat 1 · Kunjungan 2 → Perawat 2 · Kunjungan 3 → Perawat 1 · dan seterusnya.
              Hanya nombor yang <strong>Aktif</strong> sahaja yang masuk dalam rotation.
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            {loading ? 'Memuatkan...' : `${numbers.length} nombor didaftarkan · ${numbers.filter(n => n.is_active).length} aktif`}
          </span>
          <button
            id="btn-add-wasap"
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}
            style={{ ...btnStyle('primary'), display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {showAddForm ? '✕ Batal' : '+ Tambah Nombor'}
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div style={{
            background: CARD, border: `2px solid ${GREEN}`,
            borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem',
          }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#F1F5F9' }}>
              ➕ Tambah Nombor Baharu
            </h3>
            <form onSubmit={handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Nama Perawat *</label>
                  <input
                    id="add-name"
                    style={inputStyle} type="text"
                    placeholder="Cth: Perawat 1 — Ahmad"
                    value={addForm.name}
                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nombor WA * (format: 601XXXXXXXX)</label>
                  <input
                    id="add-number"
                    style={inputStyle} type="text"
                    placeholder="Cth: 601135172611"
                    value={addForm.number}
                    onChange={e => setAddForm(f => ({ ...f, number: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Urutan (sort_order)</label>
                  <input
                    id="add-sort"
                    style={inputStyle} type="number" min="0"
                    value={addForm.sort_order}
                    onChange={e => setAddForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: '#CBD5E1' }}>
                    <input
                      id="add-active"
                      type="checkbox"
                      checked={addForm.is_active}
                      onChange={e => setAddForm(f => ({ ...f, is_active: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: GREEN }}
                    />
                    Aktifkan terus
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button id="btn-add-submit" type="submit" style={btnStyle('primary')} disabled={adding}>
                  {adding ? 'Menyimpan...' : '💾 Simpan Nombor'}
                </button>
                <button type="button" style={btnStyle('ghost')} onClick={() => setShowAddForm(false)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Numbers list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Memuatkan...</div>
        ) : numbers.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem', background: CARD,
            border: `1px solid ${BORDER}`, borderRadius: '14px', color: '#64748B',
          }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
            Tiada nombor WA didaftarkan. Tambah nombor pertama anda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {numbers.map((item, idx) => (
              <div key={item.id} style={{
                background: CARD, border: `1px solid ${editingId === item.id ? GREEN : BORDER}`,
                borderRadius: '12px', overflow: 'hidden',
                transition: 'border-color 0.15s ease',
              }}>
                {editingId === item.id ? (
                  /* ── EDIT ROW ── */
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label style={labelStyle}>Nama</label>
                        <input
                          style={inputStyle} type="text"
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Nombor WA</label>
                        <input
                          style={inputStyle} type="text"
                          value={editForm.number}
                          onChange={e => setEditForm(f => ({ ...f, number: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label style={labelStyle}>Urutan</label>
                      <input
                        style={{ ...inputStyle, width: '120px' }} type="number" min="0"
                        value={editForm.sort_order}
                        onChange={e => setEditForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button style={btnStyle('primary')} onClick={handleSaveEdit} disabled={saving}>
                        {saving ? 'Menyimpan...' : '✓ Simpan'}
                      </button>
                      <button style={btnStyle('ghost')} onClick={() => setEditingId(null)}>
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── VIEW ROW ── */
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Index badge */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: item.is_active ? 'rgba(52,211,153,0.12)' : 'rgba(100,116,139,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 900,
                      color: item.is_active ? GREEN : '#64748B', flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F1F5F9', marginBottom: '0.15rem' }}>
                        {item.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <code style={{ fontSize: '0.8rem', color: '#94A3B8', background: '#0D111C', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          +{item.number}
                        </code>
                        <a
                          href={`https://wa.me/${item.number}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: '#25D366', textDecoration: 'none' }}
                        >
                          Test ↗
                        </a>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      padding: '0.2rem 0.65rem', borderRadius: '50px',
                      background: item.is_active ? 'rgba(52,211,153,0.12)' : 'rgba(100,116,139,0.1)',
                      color: item.is_active ? GREEN : '#64748B',
                      border: `1px solid ${item.is_active ? 'rgba(52,211,153,0.25)' : 'rgba(100,116,139,0.2)'}`,
                    }}>
                      {item.is_active ? '🟢 Aktif' : '⚫ Tidak Aktif'}
                    </span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={togglingId === item.id}
                        style={{
                          ...btnStyle('ghost'),
                          fontSize: '0.75rem', padding: '0.4rem 0.75rem',
                        }}
                        title={item.is_active ? 'Nyahaktifkan' : 'Aktifkan'}
                      >
                        {togglingId === item.id ? '...' : item.is_active ? '⏸ Nyahaktif' : '▶ Aktifkan'}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        style={{ ...btnStyle('ghost'), fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        style={{ ...btnStyle('danger'), fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                      >
                        {deletingId === item.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div style={{
          marginTop: '1.5rem', padding: '1rem 1.25rem',
          background: 'rgba(253,224,71,0.05)', border: '1px solid rgba(253,224,71,0.15)',
          borderRadius: '10px', fontSize: '0.8rem', color: '#FDE047', lineHeight: 1.6,
        }}>
          💡 <strong>Tip:</strong> Gunakan Sort Order untuk tetapkan urutan rotation. 0 = pertama. Nombor yang tidak aktif tidak akan masuk dalam rotation di halaman /wa.
        </div>

      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

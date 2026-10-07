'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Pengurusan Pengguna — semua akaun sistem: lihat, tambah, tukar role, aktif/nyahaktif, reset kata laluan, padam.

const ROLE_INFO = {
  super_admin:  { label: 'Super Admin', color: '#F43F5E', desc: 'Akses penuh, termasuk urus akaun admin' },
  admin:        { label: 'Admin',       color: '#F59E0B', desc: 'Urus order, stok, marketer, perawat & laporan' },
  practitioner: { label: 'Perawat',     color: '#10B981', desc: 'Terima & urus kes rawatan' },
  marketer:     { label: 'Marketer',    color: '#3B82F6', desc: 'SP sendiri, order, ads & gaji' },
};

function useLightMode() {
  const [lm, setLm] = useState(false);
  useEffect(() => {
    const check = () => setLm(document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return lm;
}

const fmtDate = d => (d ? new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const fmtAgo = d => {
  if (!d) return 'Belum pernah';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${Math.max(m, 1)} minit lalu`;
  if (m < 1440) return `${Math.floor(m / 60)} jam lalu`;
  return `${Math.floor(m / 1440)} hari lalu`;
};

export default function UserManagementPage() {
  const lm = useLightMode();
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [q, setQ]             = useState('');
  const [busyId, setBusyId]   = useState(null);
  const [msg, setMsg]         = useState(null);   // { ok, text }
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ full_name: '', email: '', phone: '', password: '', role: 'marketer' });
  const [editing, setEditing] = useState(null);   // { id, full_name, phone }

  const load = useCallback(async () => {
    try {
      const json = await (await fetch('/api/admin/user-management')).json();
      if (!json.success) throw new Error(json.error);
      setData(json); setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const call = async (method, body, id) => {
    setBusyId(id || 'new'); setMsg(null);
    try {
      const url = method === 'DELETE' ? `/api/admin/user-management?id=${id}` : '/api/admin/user-management';
      const json = await (await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}),
      })).json();
      if (!json.success) throw new Error(json.error);
      setMsg({ ok: true, text: json.message || 'Berjaya' });
      await load();
      return true;
    } catch (e) { setMsg({ ok: false, text: e.message }); return false; }
    finally { setBusyId(null); }
  };

  const me = data?.me;
  const isSuper = me?.role === 'super_admin';
  const canManage = u => u.id !== me?.id && (isSuper || u.role !== 'super_admin');
  const roleOptions = (data?.roles || []).filter(r => isSuper || r !== 'super_admin');

  const changeRole = (u, role) => {
    if (role === u.role) return;
    const extra = role === 'marketer'
      ? '\n\nKod marketer akan dijana automatik & gaji basic RM1,700.'
      : u.role === 'marketer'
        ? `\n\nAkses marketer (SP, gaji, ads) ditarik balik.${u.team_size ? ` ${u.team_size} teamsale bawah dia akan jadi marketer biasa.` : ''}${u.is_teamsale ? ' Dia tak lagi jadi teamsale.' : ''}`
        : '';
    const warnAdmin = ['admin', 'super_admin'].includes(role) ? '\n\n⚠️ Akaun ini akan dapat akses ADMIN penuh.' : '';
    if (!confirm(`Tukar role ${u.full_name} dari ${ROLE_INFO[u.role]?.label || u.role} → ${ROLE_INFO[role].label}?${extra}${warnAdmin}`)) return;
    call('PATCH', { id: u.id, role }, u.id);
  };

  const toggleActive = u => {
    if (!confirm(`${u.is_active ? 'Nyahaktif' : 'Aktifkan'} ${u.full_name}?${u.is_active ? '\n\nDia tidak boleh login selepas dinyahaktif.' : ''}`)) return;
    call('PATCH', { id: u.id, is_active: !u.is_active }, u.id);
  };

  const resetPassword = u => {
    const pw = prompt(`Kata laluan baru untuk ${u.full_name} (min 6 aksara):`);
    if (pw === null) return;
    if (pw.length < 6) return setMsg({ ok: false, text: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.' });
    call('PATCH', { id: u.id, password: pw }, u.id);
  };

  const remove = u => {
    const marketerNote = u.role === 'marketer' ? '\n\n⚠️ Order marketer ni akan dikira sebagai order HQ, dan kos ads dia dipadam. Kalau nak simpan rekod, NYAHAKTIF sahaja.' : '';
    if (!confirm(`PADAM akaun ${u.full_name} (${u.email || '-'}) secara kekal?${marketerNote}\n\nTindakan ini tidak boleh dibatalkan.`)) return;
    call('DELETE', null, u.id);
  };

  const saveEdit = async () => {
    if (await call('PATCH', { id: editing.id, full_name: editing.full_name, phone: editing.phone }, editing.id)) setEditing(null);
  };

  const addUser = async e => {
    e.preventDefault();
    if (await call('POST', form)) {
      setForm({ full_name: '', email: '', phone: '', password: '', role: 'marketer' });
      setShowAdd(false);
    }
  };

  const users = data?.users || [];
  const counts = useMemo(() => {
    const c = { all: users.length, teamsale: users.filter(u => u.is_teamsale).length };
    for (const r of Object.keys(ROLE_INFO)) c[r] = users.filter(u => u.role === r).length;
    return c;
  }, [users]);

  const filtered = users.filter(u => {
    if (roleFilter === 'teamsale' ? !u.is_teamsale : roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.is_active) return false;
    if (statusFilter === 'inactive' && u.is_active) return false;
    const s = q.trim().toLowerCase();
    return !s || [u.full_name, u.email, u.phone, u.marketer_code].some(v => (v || '').toLowerCase().includes(s));
  });

  const input = {
    padding: '0.55rem 0.7rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: ff, minWidth: 0,
    border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)', background: lm ? '#fff' : '#0B0D13', color: textPrimary,
  };
  const btn = (bg, color = '#fff') => ({ padding: '0.45rem 0.85rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', fontFamily: ff, background: bg, color });
  const chip = (on, color) => ({
    padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: ff,
    border: on ? `1px solid ${color}` : cardBorder, background: on ? `${color}22` : 'transparent', color: on ? color : textSecondary,
  });
  const linkBtn = color => ({ border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color, fontFamily: ff });
  const cell = { padding: '0.7rem 0.9rem', textAlign: 'left', verticalAlign: 'top' };

  return (
    <div style={{ fontFamily: ff, color: textPrimary, padding: '0.25rem 0' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.25rem', background: cardBg, border: cardBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>👤 Pengurusan Pengguna</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: textSecondary }}>
            Semua akaun dalam sistem — tukar role, aktif/nyahaktif, set kata laluan baru, tambah & padam akaun.
          </p>
        </div>
        <button onClick={() => { setShowAdd(v => !v); setMsg(null); }} style={btn('#10B981')}>{showAdd ? 'Tutup' : '+ Tambah Pengguna'}</button>
      </div>

      {msg && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', border: `1px solid ${msg.ok ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, background: msg.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', color: msg.ok ? '#10B981' : '#EF4444' }}>
          {msg.ok ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      {showAdd && (
        <form onSubmit={addUser} style={{ marginBottom: '1.25rem', padding: '1.1rem', borderRadius: '10px', background: cardBg, border: cardBorder, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.65rem', alignItems: 'end' }}>
          <input style={input} required placeholder="Nama penuh" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <input style={input} required type="email" placeholder="E-mel (untuk login)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={input} placeholder="No. telefon" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input style={input} required minLength={6} type="text" placeholder="Kata laluan (min 6)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <select style={input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {roleOptions.map(r => <option key={r} value={r}>{ROLE_INFO[r]?.label || r}</option>)}
          </select>
          <button disabled={busyId === 'new'} style={{ ...btn('#3B82F6'), padding: '0.6rem 0.9rem', opacity: busyId === 'new' ? 0.6 : 1 }}>{busyId === 'new' ? 'Mencipta...' : 'Cipta Akaun'}</button>
          <div style={{ gridColumn: '1 / -1', fontSize: '0.75rem', color: textMuted }}>
            {ROLE_INFO[form.role]?.desc}. Akaun terus aktif.{form.role === 'marketer' && ' Kod marketer dijana dari nama, gaji basic RM1,700.'}
          </div>
        </form>
      )}

      {/* Penapis */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => setRoleFilter('all')} style={chip(roleFilter === 'all', '#10B981')}>Semua ({counts.all || 0})</button>
        {Object.entries(ROLE_INFO).map(([r, info]) => (
          <button key={r} onClick={() => setRoleFilter(r)} style={chip(roleFilter === r, info.color)}>{info.label} ({counts[r] || 0})</button>
        ))}
        {counts.teamsale > 0 && <button onClick={() => setRoleFilter('teamsale')} style={chip(roleFilter === 'teamsale', '#8B5CF6')}>↳ Teamsale ({counts.teamsale})</button>}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...input, padding: '0.4rem 0.6rem' }}>
          <option value="all">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tak aktif</option>
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nama / e-mel / phone / kod..." style={{ ...input, flex: '1 1 200px' }} />
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: textMuted }}>Memuatkan pengguna...</div>
      ) : error ? (
        <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.85rem' }}>⚠️ {error}</div>
      ) : (
        <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: subCardBg, borderBottom: cardBorder }}>
                  {['Pengguna', 'Role', 'Status', 'Log masuk terakhir', 'Didaftar', 'Tindakan'].map(h => (
                    <th key={h} style={{ ...cell, fontSize: '0.7rem', textTransform: 'uppercase', color: textSecondary, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const info = ROLE_INFO[u.role] || { label: u.role, color: textMuted };
                  const manageable = canManage(u);
                  const busy = busyId === u.id;
                  const isEditing = editing?.id === u.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: cardBorder, opacity: busy ? 0.55 : u.is_active ? 1 : 0.65 }}>
                      <td style={{ ...cell, minWidth: '220px' }}>
                        {isEditing ? (
                          <div style={{ display: 'grid', gap: '0.35rem' }}>
                            <input style={input} value={editing.full_name} onChange={e => setEditing({ ...editing, full_name: e.target.value })} placeholder="Nama" />
                            <input style={input} value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} placeholder="No. telefon" />
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button onClick={saveEdit} style={btn('#10B981')}>Simpan</button>
                              <button onClick={() => setEditing(null)} style={btn(lm ? '#E2E8F0' : '#374151', textPrimary)}>Batal</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontWeight: 700 }}>
                              {u.full_name || '—'}
                              {u.id === me?.id && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', color: '#10B981' }}>(anda)</span>}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: textSecondary, wordBreak: 'break-all' }}>{u.email || '—'}</div>
                            {u.phone && <div style={{ fontSize: '0.74rem', color: textMuted }}>{u.phone}</div>}
                            {u.role === 'marketer' && (
                              <div style={{ fontSize: '0.7rem', marginTop: '0.15rem', color: '#A78BFA' }}>
                                {u.is_teamsale ? `↳ Teamsale · ketua: ${u.team_leader_name || '—'}` : <>Kod: {u.marketer_code || '—'}{u.team_size > 0 && ` · ${u.team_size} teamsale`}</>}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td style={cell}>
                        {manageable ? (
                          <select value={u.role} disabled={busy} onChange={e => changeRole(u, e.target.value)}
                            style={{ ...input, padding: '0.35rem 0.5rem', fontWeight: 700, color: info.color, borderColor: `${info.color}66` }}>
                            {roleOptions.includes(u.role) ? null : <option value={u.role}>{info.label}</option>}
                            {roleOptions.map(r => <option key={r} value={r}>{ROLE_INFO[r]?.label || r}</option>)}
                          </select>
                        ) : (
                          <span style={{ fontWeight: 700, color: info.color, fontSize: '0.8rem' }}>{info.label}</span>
                        )}
                      </td>
                      <td style={cell}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px', background: u.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: u.is_active ? '#10B981' : '#EF4444', whiteSpace: 'nowrap' }}>
                          {u.is_active ? '● Aktif' : '○ Tak aktif'}
                        </span>
                      </td>
                      <td style={{ ...cell, color: textSecondary, whiteSpace: 'nowrap' }} title={u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('ms-MY') : ''}>{fmtAgo(u.last_sign_in_at)}</td>
                      <td style={{ ...cell, color: textSecondary, whiteSpace: 'nowrap' }}>{fmtDate(u.created_at)}</td>
                      <td style={cell}>
                        {manageable && !isEditing ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.75rem', minWidth: '170px' }}>
                            <button disabled={busy} onClick={() => setEditing({ id: u.id, full_name: u.full_name || '', phone: u.phone || '' })} style={linkBtn('#60A5FA')}>✏️ Edit</button>
                            <button disabled={busy} onClick={() => toggleActive(u)} style={linkBtn(u.is_active ? '#F59E0B' : '#10B981')}>{u.is_active ? '⏸ Nyahaktif' : '▶ Aktifkan'}</button>
                            <button disabled={busy} onClick={() => resetPassword(u)} style={linkBtn(textSecondary)}>🔑 Kata laluan</button>
                            <button disabled={busy} onClick={() => remove(u)} style={linkBtn('#EF4444')}>🗑 Padam</button>
                          </div>
                        ) : !manageable && (
                          <span style={{ fontSize: '0.72rem', color: textMuted }}>{u.id === me?.id ? 'Akaun anda' : 'Super admin sahaja'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: textMuted }}>Tiada pengguna sepadan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

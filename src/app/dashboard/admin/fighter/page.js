'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFighterTheme, Card, Badge, rm, inputStyle, btnStyle, fmtTime } from '@/components/fighter/ui';

// HQ — Fighter (penjual bebas): lulus / gantung akaun, markup stok (default & harga khas setiap fighter).
// Fighter guna CHIP, NinjaVan & Claude API sendiri — HQ hanya bekalkan stok pada harga kos + markup.

export default function AdminFighterPage() {
  const t = useFighterTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [draft, setDraft] = useState({});        // { 'scope|sku': '1.50' }
  const [open, setOpen] = useState(null);        // id fighter — panel harga khas

  const load = useCallback(async () => {
    try {
      const j = await (await fetch('/api/admin/fighters')).json();
      if (!j.success) throw new Error(j.error);
      setData(j); setError(''); setDraft({});
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (key, body, note) => {
    setBusy(key); setMsg('');
    try {
      const j = await (await fetch('/api/admin/fighters', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
      if (!j.success) throw new Error(j.error);
      setMsg(`✅ ${note}`);
      await load();
    } catch (e) { setMsg(`⚠️ ${e.message}`); }
    finally { setBusy(''); }
  };

  if (error) return <div style={{ padding: '1.5rem', color: t.bad, fontFamily: t.ff }}>{error}</div>;
  if (!data) return <div style={{ padding: '1.5rem', color: t.muted, fontFamily: t.ff }}>Memuatkan...</div>;

  const mk = (scope, sku) => data.markups.find(m => m.scope === scope && m.sku === sku)?.markup;
  const val = (scope, sku) => draft[`${scope}|${sku}`] ?? (mk(scope, sku) ?? '');
  const setVal = (scope, sku) => e => setDraft(d => ({ ...d, [`${scope}|${sku}`]: e.target.value }));
  const dirty = scope => Object.keys(draft).filter(k => k.startsWith(`${scope}|`) && draft[k] !== '');
  const save = (scope, note) => patch(`mk-${scope}`, {
    markups: dirty(scope).map(k => ({ scope, sku: k.split('|')[1], markup: Number(draft[k]) })),
  }, note);

  const pending = data.fighters.filter(f => !f.is_active);
  const active = data.fighters.filter(f => f.is_active);
  const inp = { ...inputStyle(t), width: 90, padding: '0.4rem 0.55rem', textAlign: 'right' };
  const th = { textAlign: 'left', fontSize: '0.7rem', color: t.muted, fontWeight: 600, padding: '0.45rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '0.55rem 0.5rem', fontSize: '0.83rem', borderTop: t.border };

  const markupTable = (scope, fighter) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={th}>Produk</th><th style={th}>Kos HQ</th>
          <th style={th}>{fighter ? 'Markup khas' : 'Markup'}</th><th style={th}>Harga fighter</th>
        </tr></thead>
        <tbody>
          {data.products.map(p => {
            const base = mk('default', p.sku) ?? 0;
            const own = fighter ? mk(scope, p.sku) : undefined;
            const v = val(scope, p.sku);
            const eff = v !== '' ? Number(v) : (own ?? base);
            return (
              <tr key={p.sku}>
                <td style={td}>{p.name} <span style={{ color: t.muted, fontSize: '0.72rem' }}>{p.sku}</span></td>
                <td style={td}>{rm(p.cost_price)}</td>
                <td style={td}>
                  <span style={{ color: t.muted, marginRight: 4 }}>+RM</span>
                  <input style={inp} type="number" min="0" step="0.5" value={v} onChange={setVal(scope, p.sku)} placeholder={fighter ? String(base) : '0'} />
                  {fighter && own !== undefined && (
                    <button onClick={() => patch(`rm-${scope}-${p.sku}`, { remove_markup: { scope, sku: p.sku } }, 'Harga khas dibuang.')}
                      style={{ marginLeft: 6, background: 'none', border: 'none', color: t.bad, cursor: 'pointer', fontSize: '0.75rem' }}>✕ default</button>
                  )}
                </td>
                <td style={{ ...td, fontWeight: 700, color: t.accent }}>{rm(p.cost_price + (Number.isFinite(eff) ? eff : 0))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem' }}>
        <button style={btnStyle()} disabled={!dirty(scope).length || !!busy} onClick={() => save(scope, fighter ? `Harga khas ${fighter.full_name} disimpan.` : 'Markup default disimpan.')}>
          {busy === `mk-${scope}` ? 'Menyimpan...' : 'Simpan markup'}
        </button>
        {fighter && <span style={{ fontSize: '0.72rem', color: t.muted }}>Kosong = ikut markup default.</span>}
      </div>
    </div>
  );

  const row = f => (
    <div key={f.id} style={{ borderTop: t.border, padding: '0.75rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{f.full_name} <span style={{ color: t.muted, fontWeight: 400, fontSize: '0.75rem' }}>· {f.marketer_code}</span></div>
          <div style={{ fontSize: '0.74rem', color: t.text2 }}>{f.email}{f.phone ? ` · ${f.phone}` : ''} · daftar {fmtTime(f.created_at)}</div>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <Badge ok={f.chip_ok ? true : f.has_chip ? false : undefined}>CHIP {f.chip_ok ? 'OK' : f.has_chip ? 'ralat' : 'belum'}</Badge>
            <Badge ok={f.ai_ok || undefined}>Claude {f.ai_ok ? 'OK' : 'belum'}</Badge>
            <Badge ok={f.whatsapp ? true : undefined}>WhatsApp {f.whatsapp ? 'OK' : 'belum'}</Badge>
            <Badge ok={f.pixel || undefined}>Pixel {f.pixel ? 'OK' : 'belum'}</Badge>
          </div>
        </div>
        {f.is_active ? (
          <>
            <button style={btnStyle(t.accent, false)} onClick={() => setOpen(open === f.id ? null : f.id)}>💲 Harga khas</button>
            <button style={btnStyle(t.bad, false)} disabled={!!busy}
              onClick={() => confirm(`Gantung akaun ${f.full_name}? Dia tak boleh log masuk sehingga diaktifkan semula.`) && patch(`act-${f.id}`, { id: f.id, is_active: false }, `${f.full_name} digantung.`)}>Gantung</button>
          </>
        ) : (
          <button style={btnStyle(t.ok)} disabled={!!busy}
            onClick={() => patch(`act-${f.id}`, { id: f.id, is_active: true }, `${f.full_name} diluluskan.`)}>✅ Luluskan</button>
        )}
      </div>
      {open === f.id && f.is_active && (
        <div style={{ marginTop: '0.75rem', background: t.subBg, border: t.border, borderRadius: 8, padding: '0.85rem' }}>
          {markupTable(f.id, f)}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 980 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ADMIN · PENJUAL BEBAS</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>🥊 Fighter</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>
          {active.length} aktif · {pending.length} menunggu kelulusan · Link daftar: <strong style={{ color: t.text }}>e-syifa.com/daftar-fighter</strong>
        </p>
      </div>

      {msg && <div style={{ marginBottom: '0.85rem', fontSize: '0.82rem', color: msg.startsWith('✅') ? t.ok : t.bad }}>{msg}</div>}

      {pending.length > 0 && (
        <Card t={t} title={`⏳ Menunggu kelulusan (${pending.length})`} style={{ borderColor: t.warn }}>
          {pending.map(row)}
        </Card>
      )}

      <Card t={t} title="💲 Markup stok (default)" sub="Harga fighter = kos HQ (modul Stok) + markup seunit. Markup ni = override HQ untuk setiap unit. Harga khas setiap fighter boleh ditetapkan di bawah.">
        {markupTable('default')}
      </Card>

      <Card t={t} title={`🥊 Fighter aktif (${active.length})`}>
        {active.length ? active.map(row) : <div style={{ fontSize: '0.82rem', color: t.muted }}>Belum ada fighter aktif.</div>}
      </Card>
    </div>
  );
}

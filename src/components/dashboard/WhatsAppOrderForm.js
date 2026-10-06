'use client';

import { useEffect, useMemo, useState } from 'react';
import { ORDER_PRODUCTS, MY_STATES, EAST_MALAYSIA, priceOrder, addonInfo } from '@/lib/packages';
import { parseCustomerText } from '@/lib/parse-customer';

// Borang Order WhatsApp — dipakai /dashboard/marketer/order-wasap & /dashboard/admin/order-wasap.
// Order terus diluluskan (Selesai) & masuk Pengurusan Order / export NinjaVan.

const PRODUCT_TABS = [
  { key: 'sabun-garam',      label: '🧼 Sabun Garam' },
  { key: 'garam-pengasihan', label: '🧂 Garam Pengasihan' },
  { key: 'kasturi-kijang',   label: '🫙 Kasturi Kijang' },
];

const EMPTY = { full_name: '', phone: '', street: '', poskod: '', daerah: '', negeri: '', reference: '' };

export default function WhatsAppOrderForm({ scopeLabel, ordersHref }) {
  const [lm, setLm] = useState(false);
  useEffect(() => {
    const check = () => setLm(document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const [form, setForm]       = useState(EMPTY);
  // Smart Entry — tampal maklumat pelanggan dari WhatsApp → autofill
  const [pasteText, setPasteText] = useState('');
  const [filled, setFilled]       = useState(null);   // { keys: [...], missing: [...] } selepas autofill
  const [product, setProduct] = useState('sabun-garam');
  const [pkgIdx, setPkgIdx]   = useState(0);
  const [addons, setAddons]   = useState({});
  const [payment, setPayment] = useState('paid');
  const [origin, setOrigin]   = useState('');
  const [adjust, setAdjust]   = useState(false);
  const [customTotal, setCustomTotal] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(null);   // ringkasan order yang berjaya

  const def = ORDER_PRODUCTS[product];
  const east = EAST_MALAYSIA.includes(form.negeri);
  const priced = useMemo(() => priceOrder({ product, packageIndex: pkgIdx, addons, state: form.negeri }), [product, pkgIdx, addons, form.negeri]);
  const finalTotal = adjust && customTotal !== '' ? parseFloat(customTotal) : priced.total;

  // Tukar produk → reset pakej & add-on
  useEffect(() => { setPkgIdx(0); setAddons({}); }, [product]);
  // Order WhatsApp: COD dibenarkan untuk semua negeri termasuk Sabah/Sarawak (staf sahkan sendiri dengan pelanggan)

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setFilled(fl => fl && { ...fl, keys: fl.keys.filter(x => x !== k) });   // disunting → buang sorotan
  };

  const FIELD_LABELS = { full_name: 'Nama', phone: 'Telefon', street: 'Alamat', poskod: 'Poskod', daerah: 'Daerah', negeri: 'Negeri' };
  const autofill = () => {
    const r = parseCustomerText(pasteText);
    const keys = Object.keys(FIELD_LABELS).filter(k => r[k]);
    // Isi medan yang dikesan sahaja; medan tak dikesan kekal (tak dipadam)
    setForm(f => ({ ...f, ...Object.fromEntries(keys.map(k => [k, r[k]])) }));
    setFilled({ keys, missing: Object.keys(FIELD_LABELS).filter(k => !r[k]).map(k => FIELD_LABELS[k]) });
    setDone(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!origin) { setError('Sila pilih sumber pelanggan (FB Ads / Repeat).'); return; }
    if (adjust && !(parseFloat(customTotal) > 0)) { setError('Sila isi jumlah yang dilaraskan.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/orders/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, product, package_index: pkgIdx, addons, payment, origin,
          amount_total: adjust ? customTotal : null,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal simpan order');
      setDone({ name: form.full_name, phone: form.phone, product: def.name, pkg: priced.pkg.label, amount: json.amount, payment });
      setForm(EMPTY); setPasteText(''); setFilled(null); setAddons({}); setPkgIdx(0); setOrigin(''); setAdjust(false); setCustomTotal(''); setPayment('paid');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Gaya ──
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const accent        = '#10B981';
  const input = { width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.8rem', borderRadius: '8px', background: subCardBg, border: cardBorder, color: textPrimary, fontSize: '0.88rem', outline: 'none' };
  const label = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: textPrimary, marginBottom: '0.35rem' };
  // Medan yang diisi oleh Smart Entry → sorotan kuning (sila semak)
  const inp = (k) => (filled?.keys.includes(k) ? { ...input, border: '1.5px solid #F59E0B', background: lm ? '#FFFBEB' : 'rgba(245,158,11,0.08)' } : input);
  const card  = { background: cardBg, border: cardBorder, borderRadius: '12px', padding: '1.25rem', display: 'grid', gap: '0.9rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' };
  const h2    = { margin: 0, fontSize: '0.95rem', fontWeight: 800, color: textPrimary };
  const pill  = (on, color = accent) => ({
    padding: '0.6rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, textAlign: 'left',
    border: on ? `2px solid ${color}` : cardBorder, background: on ? `${color}1A` : subCardBg, color: on ? textPrimary : textSecondary,
  });
  const rm = v => `RM ${Number(v || 0).toFixed(2)}`;

  return (
    <div style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', color: textPrimary, maxWidth: '760px', margin: '0 auto', padding: '0.25rem 0 2rem' }}>
      {/* Header */}
      <div style={{ ...card, marginBottom: '1.25rem', display: 'block' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>💬 Order WhatsApp</h1>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.84rem', color: textSecondary, lineHeight: 1.55 }}>
          Masukkan order pelanggan dari WhatsApp. Order <strong style={{ color: accent }}>terus diluluskan</strong> — stok ditolak,
          sales dikira{scopeLabel ? ` (${scopeLabel})` : ''} &amp; order masuk senarai hantar NinjaVan.
        </p>
      </div>

      {/* Berjaya */}
      {done && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem 1.1rem', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 800, color: accent, marginBottom: '0.2rem' }}>✅ Order disimpan & diluluskan</div>
          {done.name} ({done.phone}) — {done.product} · {done.pkg} · <strong>{rm(done.amount)}</strong> ({done.payment === 'cod' ? 'COD' : 'dah bayar'})
          {ordersHref && <> · <a href={ordersHref} style={{ color: accent, fontWeight: 700 }}>Lihat senarai order →</a></>}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'grid', gap: '1.25rem' }}>
        {/* 0. Smart Entry */}
        <div style={{ ...card, border: lm ? '1.5px dashed #93C5FD' : '1.5px dashed rgba(96,165,250,0.45)' }}>
          <div>
            <h2 style={h2}>✨ Smart Entry <span style={{ fontSize: '0.75rem', fontWeight: 500, color: textMuted }}>(pilihan)</span></h2>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: textSecondary, lineHeight: 1.5 }}>
              Tampal maklumat pelanggan dari WhatsApp (nama, alamat, poskod, negeri, telefon) — tekan <strong>Autofill</strong> dan semak semula sebelum simpan.
            </p>
          </div>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            rows={6}
            placeholder={'Cth:\nPn Mas Yusof\n20 Jln Pulai 36\nTaman Pulai Utama\n81300 Skudai\nJohor\n0137525609'}
            style={{ ...input, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={autofill} disabled={!pasteText.trim()}
              style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: 'none', background: '#3B82F6', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: pasteText.trim() ? 'pointer' : 'not-allowed', opacity: pasteText.trim() ? 1 : 0.5 }}>
              ✨ Autofill
            </button>
            {pasteText && (
              <button type="button" onClick={() => { setPasteText(''); setFilled(null); }}
                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: cardBorder, background: 'transparent', color: textSecondary, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                Kosongkan
              </button>
            )}
          </div>
          {filled && (
            <div style={{ padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', lineHeight: 1.55,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', color: textPrimary }}>
              ⚠️ <strong>{filled.keys.length} medan diisi automatik</strong> (bersorot kuning) — <strong>sila semak semula</strong> ejaan &amp; alamat sebelum simpan.
              {filled.missing.length > 0 && (
                <div style={{ marginTop: '0.25rem', color: '#B45309' }}>Tak dapat dikesan — isi sendiri: <strong>{filled.missing.join(', ')}</strong></div>
              )}
            </div>
          )}
        </div>

        {/* 1. Pelanggan */}
        <div style={card}>
          <h2 style={h2}>1. Maklumat Pelanggan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
            <div><label style={label}>Nama penuh *</label><input style={inp('full_name')} value={form.full_name} onChange={set('full_name')} required /></div>
            <div><label style={label}>No. telefon / WhatsApp *</label><input style={inp('phone')} type="tel" inputMode="tel" placeholder="0123456789" value={form.phone} onChange={set('phone')} required /></div>
          </div>
          <div><label style={label}>Alamat (No. rumah, jalan, taman) *</label><input style={inp('street')} value={form.street} onChange={set('street')} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem' }}>
            <div><label style={label}>Poskod *</label><input style={inp('poskod')} inputMode="numeric" value={form.poskod} onChange={set('poskod')} required /></div>
            <div><label style={label}>Daerah / Bandar *</label><input style={inp('daerah')} value={form.daerah} onChange={set('daerah')} required /></div>
            <div>
              <label style={label}>Negeri *</label>
              <select style={inp('negeri')} value={form.negeri} onChange={set('negeri')} required>
                <option value="">— Pilih —</option>
                {MY_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Produk */}
        <div style={card}>
          <h2 style={h2}>2. Produk &amp; Pakej</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PRODUCT_TABS.map(t => (
              <button type="button" key={t.key} onClick={() => setProduct(t.key)} style={pill(product === t.key, '#3B82F6')}>{t.label}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {def.packages.map((p, i) => (
              <button type="button" key={p.label} onClick={() => setPkgIdx(i)} style={{ ...pill(pkgIdx === i), display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span>{p.label}{p.includesKasturi ? ' + 🎁 Free Kasturi' : ''}{p.freePostage ? ' · Free Pos (Semenanjung)' : ''}</span>
                <span style={{ color: accent, whiteSpace: 'nowrap' }}>RM{p.price}</span>
              </button>
            ))}
          </div>
          {def.addons.filter(k => !(priced.pkg.noAddons || []).includes(k)).length > 0 && (
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ ...label, marginBottom: 0 }}>Add-on</span>
              {def.addons.filter(k => !(priced.pkg.noAddons || []).includes(k)).map(k => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', color: textSecondary, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!addons[k]} onChange={e => setAddons(a => ({ ...a, [k]: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: accent }} />
                  {addonInfo(k).label} <span style={{ color: accent, fontWeight: 700 }}>+RM{addonInfo(k).price}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 3. Bayaran & sumber */}
        <div style={card}>
          <h2 style={h2}>3. Bayaran &amp; Sumber Pelanggan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
            <button type="button" onClick={() => setPayment('paid')} style={pill(payment === 'paid')}>💳 Dah bayar <span style={{ fontWeight: 500, color: textMuted }}>(transfer / QR)</span></button>
            <button type="button" onClick={() => setPayment('cod')} style={pill(payment === 'cod', '#F97316')}>
              📦 COD <span style={{ fontWeight: 500, color: textMuted }}>(bayar masa terima)</span>
            </button>
          </div>
          <div>
            <span style={label}>Pelanggan datang dari *</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[['fb_ads', '📘 FB Ads'], ['repeat', '🔁 Repeat']].map(([v, l]) => (
                <button type="button" key={v} onClick={() => setOrigin(v)} style={pill(origin === v, '#8B5CF6')}>{l}</button>
              ))}
            </div>
          </div>
          <div><label style={label}>No. rujukan / nota <span style={{ color: textMuted, fontWeight: 400 }}>(pilihan)</span></label>
            <input style={input} maxLength={120} placeholder="Cth: DuitNow 28/9 · ref 123456" value={form.reference} onChange={set('reference')} />
          </div>
        </div>

        {/* 4. Ringkasan */}
        <div style={card}>
          <h2 style={h2}>4. Ringkasan</h2>
          <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.86rem' }}>
            {[
              [`${def.name} — ${priced.pkg.label}`, rm(priced.pkg.price)],
              ...priced.addonKeys.map(k => [`Add-on: ${addonInfo(k).label}`, rm(addonInfo(k).price)]),
              ...(priced.pkg.includesKasturi ? [['🎁 Free Gift: Minyak Kasturi Kijang', 'PERCUMA']] : []),
              [`Postage${form.negeri ? ` (${east ? 'Sabah/Sarawak' : 'Semenanjung'})` : ''}`, priced.postage === 0 ? 'PERCUMA' : rm(priced.postage)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: textSecondary }}>
                <span>{k}</span><span style={{ fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: cardBorder, margin: '0.3rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800 }}>
              <span>Jumlah</span>
              <span style={{ color: accent }}>{rm(finalTotal)}{adjust && customTotal !== '' && <span style={{ fontSize: '0.72rem', color: textMuted, fontWeight: 500, textDecoration: 'line-through', marginLeft: '0.4rem' }}>{rm(priced.total)}</span>}</span>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: textSecondary, cursor: 'pointer' }}>
            <input type="checkbox" checked={adjust} onChange={e => { setAdjust(e.target.checked); setCustomTotal(''); }} style={{ width: '16px', height: '16px', accentColor: accent }} />
            Laraskan jumlah (harga khas / diskaun)
          </label>
          {adjust && (
            <div><label style={label}>Jumlah akhir (RM) *</label>
              <input style={input} type="number" inputMode="decimal" min="0" step="0.01" placeholder={String(priced.total)} value={customTotal} onChange={e => setCustomTotal(e.target.value)} />
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: textMuted }}>Harga asal RM{priced.total} disimpan dalam nota order untuk rujukan.</p>
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: '0.75rem 0.9rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.84rem' }}>{error}</div>
        )}

        <button type="submit" disabled={saving} style={{
          padding: '0.9rem 1.2rem', borderRadius: '10px', border: 'none', background: accent, color: '#fff',
          fontWeight: 800, fontSize: '1rem', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'Menyimpan...' : `✅ Simpan & Luluskan Order — ${rm(finalTotal)}`}
        </button>
      </form>
    </div>
  );
}

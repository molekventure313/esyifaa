'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';
import { RH_PACKAGES, RH_NAME, RH_SOURCE } from '@/lib/ruqyah-harian';
import { useWaButton, HQ_WHATSAPP_PENGISIAN } from '@/components/salespage/useSalesContact';
import { useRhSlots, SlotMeter } from '@/components/salespage/ruqyah-harian/Sections';

// #13 + #15 — Pakej & borang bayaran FPX (prabayar, tiada potongan automatik)

const FEATURES = [
  '🌅 Bacaan ruqyah setiap pagi',
  '🌙 Bacaan ruqyah setiap malam',
  '🔥✂️🛡️💚 4 lapisan: pembakar jin · pembatal sihir · benteng · syifa\'',
  '📢 Masuk channel WhatsApp pesakit Ruqyah Harian',
  '🛡️ Jaminan 30 hari wang dikembalikan',
];

const DIAL_CODES = [
  { code: '+60', flag: '🇲🇾' }, { code: '+673', flag: '🇧🇳' }, { code: '+65', flag: '🇸🇬' }, { code: '+62', flag: '🇮🇩' },
];

function utm() {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].map(k => [k, p.get(k) || null]));
}

function Inner({ source = RH_SOURCE }) {
  const searchParams = useSearchParams();
  const marketerCode = searchParams?.get('m') || '';
  const slots = useRhSlots();
  const full = slots?.remaining === 0;

  const [selected, setSelected] = useState(0);   // 0 = 3 Bulan (disyorkan)
  const [fpxPixelId, setFpxPixelId] = useState(null);
  const [form, setForm] = useState({ full_name: '', dialCode: '+60', phone: '', problem: '', honeypot: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pkg = RH_PACKAGES[selected];
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  const wa = useWaButton({
    hqNumber: HQ_WHATSAPP_PENGISIAN,
    message: full ? `Assalamualaikum, saya nak masuk senarai menunggu ${RH_NAME}` : `Assalamualaikum, saya nak daftar ${RH_NAME} (${pkg.label})`,
    product: RH_NAME,
  });

  // Pixel FPX HQ (sama dgn SP Pengisian) — SP marketer guna pixel marketer
  useEffect(() => {
    const isMarketer = new URLSearchParams(window.location.search).has('m') || window.location.pathname.startsWith('/m/');
    if (isMarketer) return;
    const script = document.createElement('script');
    script.src = '/api/pixel-fpx-init';
    script.async = true;
    document.head.appendChild(script);
    fetch('/api/tracking/fpx-pixel-id').then(r => r.json()).then(j => { if (j.fpx_pixel_id) setFpxPixelId(j.fpx_pixel_id); }).catch(() => {});
    return () => { try { document.head.removeChild(script); } catch (_) {} };
  }, []);

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim()) return setError('Sila masukkan nama penuh anda.');
    if (!form.phone.trim()) return setError('Sila masukkan nombor WhatsApp anda.');
    setLoading(true);
    try {
      const pid = fpxPixelId || window.__fpxPixelId;
      const eventId = generateEventId();
      if (window.fbq) {
        if (pid) window.fbq('trackSingle', pid, 'InitiateCheckout', { value: pkg.price, currency: 'MYR', content_name: `${RH_NAME} — ${pkg.label}` }, { eventID: eventId });
        else window.fbq('track', 'InitiateCheckout', { value: pkg.price, currency: 'MYR' });
      }
      const { fbp, fbc } = getPixelCookies();
      const u = utm();
      const res = await fetch('/api/payments/chip/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: `${form.dialCode}${form.phone.replace(/^0+/, '')}`,
          problem: `${RH_NAME} (${pkg.label})${form.problem.trim() ? ` | Masalah: ${form.problem.trim()}` : ''}`,
          amount_in_myr: pkg.price,
          source, marketer_code: marketerCode,
          source_page: window.location.pathname, event_id: eventId, honeypot: form.honeypot,
          landing_page_url: window.location.href, referrer_url: document.referrer,
          fbp: fbp || null, fbc: fbc || (u.fbclid ? `fb.1.${Date.now()}.${u.fbclid}` : null),
          ...u,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.checkout_url) { window.location.href = json.checkout_url; return; }
      throw new Error(json.error || 'Gagal memulakan bayaran FPX. Sila cuba lagi.');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const input = { width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', fontFamily: ff, boxSizing: 'border-box', background: '#FFFFFF', color: '#0F172A' };

  return (
    <section id="borang" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)', padding: '4.5rem 1.25rem', fontFamily: ff, borderBottom: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.15rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 0.6rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Jangan tunggu ia datang balik — mula dibacakan <span style={{ color: '#047857' }}>setiap hari</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.98rem', margin: '0 0 1.25rem' }}>Pilih pakej anda. Bayar sekali melalui FPX — tiada potongan automatik.</p>
          <SlotMeter />
        </div>

        {/* Pakej — besar dahulu */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {RH_PACKAGES.map((p, i) => {
            const on = selected === i;
            return (
              <button key={p.months} type="button" onClick={() => setSelected(i)} style={{
                position: 'relative', textAlign: 'left', cursor: 'pointer', fontFamily: ff, padding: '1.5rem 1.25rem 1.25rem', borderRadius: '18px',
                background: on ? '#FFFFFF' : '#F8FAFC', border: on ? '2.5px solid #10B981' : '1.5px solid #E2E8F0',
                boxShadow: on ? '0 12px 30px rgba(16,185,129,0.18)' : 'none',
              }}>
                {p.badge && <span style={{ position: 'absolute', top: '-0.7rem', left: '1.25rem', background: '#047857', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.08em', padding: '0.3rem 0.7rem', borderRadius: '999px' }}>{p.badge}</span>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>{p.label}</span>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${on ? '#10B981' : '#CBD5E1'}`, background: on ? '#10B981' : 'transparent', boxShadow: on ? 'inset 0 0 0 3px #FFFFFF' : 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.6rem 0 0.2rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#047857' }}>RM{p.price}</span>
                  {p.originalPrice && <span style={{ fontSize: '0.95rem', color: '#94A3B8', textDecoration: 'line-through' }}>RM{p.originalPrice}</span>}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
                  ±{p.readings} bacaan ruqyah{p.savings ? <> · <strong style={{ color: '#DC2626' }}>Jimat RM{p.savings}</strong></> : ''}
                </div>
                <div style={{ display: 'grid', gap: '0.35rem' }}>
                  {FEATURES.map(f => <div key={f} style={{ fontSize: '0.8rem', color: '#334155' }}>✓ {f}</div>)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Borang */}
        <form onSubmit={submit} style={{ maxWidth: '560px', margin: '0 auto', background: '#FFFFFF', border: '2px solid #CBD5E1', borderRadius: '20px', padding: '1.75rem 1.4rem', display: 'grid', gap: '1rem' }}>
          <div style={{ fontWeight: 800, color: '#0F172A' }}>Maklumat Pesakit</div>
          <input style={input} placeholder="Nama penuh" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={form.dialCode} onChange={e => setForm({ ...form, dialCode: e.target.value })} style={{ ...input, width: 'auto' }}>
              {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
            </select>
            <input style={input} inputMode="tel" placeholder="No. WhatsApp (cth: 0123456789)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <textarea style={{ ...input, minHeight: '80px', resize: 'vertical' }} placeholder="Ceritakan ringkas masalah / gangguan yang dialami (pilihan)" value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} maxLength={500} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={e => setForm({ ...form, honeypot: e.target.value })} style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />

          <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0F172A' }}>
            <span>{RH_NAME} — {pkg.label}</span><span style={{ color: '#047857' }}>RM{pkg.price}</span>
          </div>

          {error && <div style={{ color: '#DC2626', fontSize: '0.88rem', fontWeight: 600 }}>⚠️ {error}</div>}

          {full ? (
            <div style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px', background: '#FEF2F2', color: '#991B1B', fontWeight: 700 }}>
              ⛔ Slot bulan ini dah penuh. Sertai senarai menunggu melalui WhatsApp di bawah — slot dibuka semula 1hb bulan depan.
            </div>
          ) : (
            <button disabled={loading} style={{ padding: '1.05rem', borderRadius: '50px', border: 'none', cursor: loading ? 'wait' : 'pointer', background: 'linear-gradient(180deg, #10B981, #047857)', color: '#FFFFFF', fontWeight: 900, fontSize: '1.02rem', fontFamily: ff, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Menyambung ke FPX...' : `💳 Bayar RM${pkg.price} Melalui FPX →`}
            </button>
          )}
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', textAlign: 'center', lineHeight: 1.55 }}>
            Selepas bayaran, perawat akan hubungi anda di WhatsApp untuk minta <strong>nama penuh &amp; gambar diri</strong>, dan masukkan anda ke channel WhatsApp pesakit Ruqyah Harian.
          </p>
          <div style={{ textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', visibility: wa.hidden ? 'hidden' : 'visible' }}>
            <a href={wa.href} onClick={wa.onClick} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', borderBottom: '1px dashed #059669' }}>
              💬 {full ? 'Sertai senarai menunggu di WhatsApp' : 'Ada soalan? Tanya kami di WhatsApp'}
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function RuqyahHarianCheckout(props) {
  return <Suspense fallback={null}><Inner {...props} /></Suspense>;
}

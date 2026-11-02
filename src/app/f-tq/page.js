'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// TQ page order FIGHTER (penjual bebas). Status bayaran disemak terus dengan CHIP fighter,
// Purchase dihantar ke pixel fighter SAHAJA (sekali setiap order), butang WhatsApp ke no. fighter.

const PRODUCT = { 'garam-pengasihan': 'Garam Pengasihan Masakan', 'kasturi-kijang': 'Minyak Kasturi Kijang' };
const productOfSource = s => PRODUCT[s] || 'Sabun Garam Himalaya';

function firePurchase(pixelId, orderRef, amount, name) {
  if (!pixelId) return;
  const key = `ftq_${orderRef}`;
  try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch (_) {}
  if (!window.fbq) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  }
  window.fbq('init', pixelId);
  window.fbq('trackSingle', pixelId, 'Purchase', { value: amount, currency: 'MYR', content_name: name }, { eventID: `fo_${orderRef}` });
}

function Inner() {
  const params = useSearchParams();
  const id = params.get('o') || '';
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError('Rujukan order tiada.'); return; }
    let tries = 0, alive = true, timer;
    const load = async () => {
      try {
        const j = await (await fetch(`/api/public/fighter-order?o=${encodeURIComponent(id)}`, { cache: 'no-store' })).json();
        if (!alive) return;
        if (!j.success) { setError('Order tidak dijumpai.'); return; }
        setD(j);
        if (j.payment_status === 'completed') firePurchase(j.pixel_id, j.order_ref, j.amount, productOfSource(j.source));
        if (j.payment_status === 'pending' && j.payment_type === 'fpx_payment' && ++tries < 20) timer = setTimeout(load, 3000);
      } catch { if (alive) setError('Gagal semak status order.'); }
    };
    load();
    return () => { alive = false; clearTimeout(timer); };
  }, [id]);

  const ff = 'var(--font-inter), -apple-system, sans-serif';
  const box = { maxWidth: 480, margin: '0 auto', padding: '2.5rem 1.25rem', fontFamily: ff, textAlign: 'center', color: '#0F172A' };
  if (error) return <div style={box}><h1 style={{ fontSize: '1.2rem' }}>⚠️ {error}</h1></div>;
  if (!d) return <div style={box}>Menyemak order anda...</div>;

  const paid = d.payment_status === 'completed';
  const failed = ['failed', 'cancelled'].includes(d.payment_status);
  const product = productOfSource(d.source);
  const msg = `Assalamualaikum, saya ${d.first_name}. Saya dah order ${product} (Ref: ${d.order_ref}, RM${d.amount.toFixed(2)}). Mohon pengesahan ya.`;

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={box}>
        <div style={{ fontSize: '3rem' }}>{paid ? '✅' : failed ? '❌' : '⏳'}</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.5rem 0' }}>
          {paid ? `Terima kasih, ${d.first_name}!` : failed ? 'Bayaran tidak berjaya' : 'Menunggu pengesahan bayaran...'}
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {paid
            ? (d.payment_type === 'cod'
              ? <>Order <strong>{product}</strong> anda telah diterima. Bayar <strong>RM{d.amount.toFixed(2)}</strong> semasa parcel sampai (COD).</>
              : <>Bayaran <strong>RM{d.amount.toFixed(2)}</strong> untuk <strong>{product}</strong> telah diterima.</>)
            : failed ? 'Sila cuba semula atau hubungi penjual melalui WhatsApp.' : 'Halaman ini akan dikemas kini secara automatik.'}
        </p>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '1rem', margin: '1.25rem 0', fontSize: '0.88rem', color: '#334155', textAlign: 'left', lineHeight: 1.8 }}>
          <div>🧾 Rujukan order: <strong>{d.order_ref}</strong></div>
          {d.seller && <div>🛍️ Penjual: <strong>{d.seller}</strong></div>}
          {paid && <div>🚚 Parcel akan dihantar melalui NinjaVan dalam 1–3 hari bekerja.</div>}
        </div>
        {d.whatsapp && (
          <a href={`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', background: '#25D366', color: '#FFFFFF', padding: '1rem', borderRadius: 12, fontWeight: 800, textDecoration: 'none', fontSize: '1rem' }}>
            💬 WhatsApp Penjual
          </a>
        )}
      </div>
    </main>
  );
}

export default function FighterThankYouPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}

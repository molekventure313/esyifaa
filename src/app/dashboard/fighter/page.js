'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFighterTheme, Card, Badge, rm } from '@/components/fighter/ui';

// Fighter — Dashboard: senarai semak persediaan akaun + harga stok HQ (kos + markup)

export default function FighterDashboardPage() {
  const t = useFighterTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/fighter/settings').then(r => r.json()).then(j => (j.success ? setData(j) : setError(j.error)))
      .catch(() => setError('Gagal muatkan dashboard.'));
  }, []);

  if (error) return <div style={{ padding: '1.5rem', color: t.bad, fontFamily: t.ff }}>{error}</div>;
  if (!data) return <div style={{ padding: '1.5rem', color: t.muted, fontFamily: t.ff }}>Memuatkan...</div>;
  const s = data.settings;

  const steps = [
    { done: s.chip_status === 'ok', label: 'Sambung CHIP (FPX)', hint: 'Bayaran pelanggan masuk terus ke akaun anda' },
    { done: !!s.whatsapp, label: 'Isi No. WhatsApp', hint: 'Untuk sales page & TQ page' },
    { done: !!s.sender_name, label: 'Isi nama pengirim NinjaVan', hint: 'Untuk waybill & CSV NinjaVan' },
    { done: !!s.meta_pixel_id, label: 'Isi Meta Pixel ID', hint: 'Pilihan — untuk tracking iklan', optional: true },
    { done: s.ai_status === 'ok', label: 'Sambung Claude API', hint: 'Pilihan — untuk SP Generator', optional: true },
  ];
  const required = steps.filter(x => !x.optional);
  const ready = required.every(x => x.done);

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 900 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>PORTAL FIGHTER</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>🥊 Assalamualaikum, {data.profile.full_name}</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>
          Kod fighter: <strong style={{ color: t.text }}>{data.profile.code || '—'}</strong> · Order, bayaran & NinjaVan anda berasingan dari HQ. Stok diambil dari HQ pada harga di bawah.
        </p>
      </div>

      <Card t={t} title={ready ? '✅ Akaun sedia' : '🚀 Lengkapkan persediaan akaun'}
        sub={ready ? 'Semua tetapan wajib dah lengkap.' : `${required.filter(x => x.done).length} daripada ${required.length} langkah wajib selesai.`}>
        {steps.map(x => (
          <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0', borderTop: t.border }}>
            <span style={{ fontSize: '1rem' }}>{x.done ? '✅' : x.optional ? '⚪' : '⬜'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{x.label}{x.optional && <span style={{ color: t.muted, fontWeight: 400 }}> (pilihan)</span>}</div>
              <div style={{ fontSize: '0.72rem', color: t.muted }}>{x.hint}</div>
            </div>
            {!x.done && <Link href="/dashboard/fighter/tetapan" style={{ fontSize: '0.78rem', color: t.accent, fontWeight: 700, textDecoration: 'none' }}>Tetapkan →</Link>}
          </div>
        ))}
      </Card>

      <Card t={t} title="📦 Harga Stok HQ" sub="Harga seunit yang HQ caj untuk setiap unit dihantar bagi order anda. Caj dikumpul & dibilkan secara berkala.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
          {data.prices.map(p => (
            <div key={p.sku} style={{ background: t.subBg, border: t.border, borderRadius: 8, padding: '0.75rem 0.9rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: t.accent, marginTop: '0.2rem' }}>{rm(p.price)} <span style={{ fontSize: '0.72rem', color: t.muted, fontWeight: 500 }}>/ {p.unit || 'unit'}</span></div>
            </div>
          ))}
        </div>
      </Card>

      <Card t={t} title="🛠️ Akan datang">
        <div style={{ fontSize: '0.8rem', color: t.text2, lineHeight: 1.7 }}>
          <div><Badge>Fasa 2</Badge> Sales page anda (salinan SP HQ) · Order COD & FPX · Export CSV NinjaVan · Upload waybill</div>
          <div style={{ marginTop: '0.35rem' }}><Badge>Fasa 3</Badge> Bil stok & lejar caj</div>
          <div style={{ marginTop: '0.35rem' }}><Badge>Fasa 4</Badge> SP Generator (Claude API anda)</div>
        </div>
      </Card>
    </div>
  );
}

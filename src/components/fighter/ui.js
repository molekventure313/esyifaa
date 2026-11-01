'use client';
// Fighter — warna & komponen kecil dikongsi halaman fighter + halaman Fighter HQ
import { useState, useEffect } from 'react';

export function useFighterTheme() {
  const [lm, setLm] = useState(false);
  useEffect(() => {
    const check = () => setLm(document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return {
    lm,
    cardBg: lm ? '#FFFFFF' : '#10131A',
    subBg: lm ? '#F8FAFC' : '#090A0F',
    border: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
    text: lm ? '#0F172A' : '#F9FAFB',
    text2: lm ? '#475569' : '#9CA3AF',
    muted: lm ? '#64748B' : '#6B7280',
    accent: '#A855F7',
    ok: '#10B981', bad: '#EF4444', warn: '#F59E0B',
    ff: 'var(--font-inter), -apple-system, sans-serif',
  };
}

export const rm = v => `RM${Number(v || 0).toFixed(2)}`;
export const fmtTime = d => (d ? new Date(d).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export function Card({ t, title, sub, children, style }) {
  return (
    <div style={{ background: t.cardBg, border: t.border, borderRadius: 10, padding: '1.1rem 1.25rem', marginBottom: '1rem', ...style }}>
      {title && <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: sub ? '0.15rem' : '0.75rem' }}>{title}</div>}
      {sub && <div style={{ fontSize: '0.78rem', color: t.text2, marginBottom: '0.85rem', lineHeight: 1.5 }}>{sub}</div>}
      {children}
    </div>
  );
}

export function Badge({ ok, children }) {
  const c = ok === true ? '#10B981' : ok === false ? '#EF4444' : '#94A3B8';
  return (
    <span style={{ display: 'inline-block', padding: '0.12rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, color: c, background: `${c}22`, border: `1px solid ${c}55` }}>
      {children}
    </span>
  );
}

export const inputStyle = t => ({
  width: '100%', padding: '0.6rem 0.75rem', borderRadius: 7, border: t.border, background: t.subBg,
  color: t.text, fontSize: '0.85rem', fontFamily: t.ff, outline: 'none', boxSizing: 'border-box',
});

export const btnStyle = (color = '#A855F7', solid = true) => ({
  padding: '0.55rem 1rem', borderRadius: 7, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
  border: `1px solid ${color}`, background: solid ? color : 'transparent', color: solid ? '#FFFFFF' : color,
});

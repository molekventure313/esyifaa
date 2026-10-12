// SP awam yang dijana marketer: section angle (dari content) + section HQ (dikunci) ikut susunan FSP.
import MarketerPixelProvider from '@/components/salespage/MarketerPixelProvider';
import { SLOTS } from '@/lib/sp-generator/schema';
import { SP_PRODUCTS } from '@/lib/sp-generator/products';
import {
  GenAnnouncement, GenHero, GenProblems, GenFears, GenSolution, GenBenefits, GenGoals, GenCta, GenClosing,
} from '@/components/salespage/generated/AngleSections';
import { HQ_SLOTS } from '@/components/salespage/generated/registry';

// Peta dibina di sini (server) — objek eksport dari modul 'use client' tak boleh diindeks di server
const ANGLE_COMPONENTS = {
  announcement: GenAnnouncement, hero: GenHero, problems: GenProblems, fears: GenFears, solution: GenSolution,
  benefits: GenBenefits, goals: GenGoals, cta: GenCta, closing: GenClosing,
};

export default function GeneratedPage({ productKey, content }) {
  const product = SP_PRODUCTS[productKey];
  const hq = HQ_SLOTS[productKey] || {};
  const hidden = new Set(content?.hidden || []);
  const theme = { accent: product.accent, accentSoft: product.accentSoft, accentBorder: product.accentBorder };

  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A' }}>
      <MarketerPixelProvider />
      {SLOTS.map(slot => {
        if (hidden.has(slot.key)) return null;
        if (slot.type === 'angle') {
          const C = ANGLE_COMPONENTS[slot.key];
          return <C key={slot.key} data={content?.[slot.key]} theme={theme} product={product} />;
        }
        const render = hq[slot.key];
        return render ? <div key={slot.key}>{render()}</div> : null;
      })}
      <footer style={{ background: '#F8FAFC', color: '#64748B', padding: '2.5rem 1rem', textAlign: 'center', fontSize: '0.82rem', lineHeight: 1.6, borderTop: '1px solid #E2E8F0', fontFamily: 'var(--font-inter), -apple-system, sans-serif' }}>
        © {new Date().getFullYear()} E-Syifa&apos;. Ikhtiar berasaskan Al-Quran &amp; Sunnah — kesembuhan hanya daripada Allah SWT. Tiada unsur syirik.
      </footer>
    </main>
  );
}

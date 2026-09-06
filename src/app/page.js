'use client';

import { useEffect, useState } from 'react';
import ESyifaaHomepage from '@/components/homepage/ESyifaaHomepage';

// Main salespage components
import HeroSection from '@/components/salespage/HeroSection';
import TestimonialSection from '@/components/salespage/TestimonialSection';
import ProblemSection from '@/components/salespage/ProblemSection';
import FearsSection from '@/components/salespage/FearsSection';
import MatlamatSection from '@/components/salespage/MatlamatSection';
import TestimonialPart2Section from '@/components/salespage/TestimonialPart2Section';
import CTASection from '@/components/salespage/CTASection';
import PricingSection from '@/components/salespage/PricingSection';
import GuaranteeSection from '@/components/salespage/GuaranteeSection';
import ProcessSection from '@/components/salespage/ProcessSection';
import ApplicationForm from '@/components/salespage/ApplicationForm';
import FAQSection from '@/components/salespage/FAQSection';
import ClosingSection from '@/components/salespage/ClosingSection';

// Variant: sihir
import SihirHero from '@/components/salespage/variants/sihir/HeroSection';
import SihirProblem from '@/components/salespage/variants/sihir/ProblemSection';
import SihirMatlamat from '@/components/salespage/variants/sihir/MatlamatSection';
import SihirFAQ from '@/components/salespage/variants/sihir/FAQSection';
import SihirClosing from '@/components/salespage/variants/sihir/ClosingSection';

// Variant: saka
import SakaHero from '@/components/salespage/variants/saka/HeroSection';
import SakaProblem from '@/components/salespage/variants/saka/ProblemSection';
import SakaMatlamat from '@/components/salespage/variants/saka/MatlamatSection';
import SakaFAQ from '@/components/salespage/variants/saka/FAQSection';
import SakaClosing from '@/components/salespage/variants/saka/ClosingSection';

// Variant: penyakit-misteri
import PenyakitMisteriHero from '@/components/salespage/variants/penyakit-misteri/HeroSection';
import PenyakitMisteriProblem from '@/components/salespage/variants/penyakit-misteri/ProblemSection';
import PenyakitMisteriMatlamat from '@/components/salespage/variants/penyakit-misteri/MatlamatSection';
import PenyakitMisteriFAQ from '@/components/salespage/variants/penyakit-misteri/FAQSection';
import PenyakitMisteriClosing from '@/components/salespage/variants/penyakit-misteri/ClosingSection';

// Variant: gangguan-berulang
import GangguanBerulangHero from '@/components/salespage/variants/gangguan-berulang/HeroSection';
import GangguanBerulangProblem from '@/components/salespage/variants/gangguan-berulang/ProblemSection';
import GangguanBerulangMatlamat from '@/components/salespage/variants/gangguan-berulang/MatlamatSection';
import GangguanBerulangFAQ from '@/components/salespage/variants/gangguan-berulang/FAQSection';
import GangguanBerulangClosing from '@/components/salespage/variants/gangguan-berulang/ClosingSection';

// Variant: belum-zuriat
import BelumZuriatHero from '@/components/salespage/variants/belum-zuriat/HeroSection';
import BelumZuriatProblem from '@/components/salespage/variants/belum-zuriat/ProblemSection';
import BelumZuriatMatlamat from '@/components/salespage/variants/belum-zuriat/MatlamatSection';
import BelumZuriatFAQ from '@/components/salespage/variants/belum-zuriat/FAQSection';
import BelumZuriatClosing from '@/components/salespage/variants/belum-zuriat/ClosingSection';

// Variant: kedai-tutup
import KedaiTutupHero from '@/components/salespage/variants/kedai-tutup/HeroSection';
import KedaiTutupProblem from '@/components/salespage/variants/kedai-tutup/ProblemSection';
import KedaiTutupMatlamat from '@/components/salespage/variants/kedai-tutup/MatlamatSection';
import KedaiTutupFAQ from '@/components/salespage/variants/kedai-tutup/FAQSection';
import KedaiTutupClosing from '@/components/salespage/variants/kedai-tutup/ClosingSection';


// Map slug to custom components
const VARIANT_MAP = {
  'sihir': {
    Hero: SihirHero,
    Problem: SihirProblem,
    Matlamat: SihirMatlamat,
    FAQ: SihirFAQ,
    Closing: SihirClosing,
  },
  'saka': {
    Hero: SakaHero,
    Problem: SakaProblem,
    Matlamat: SakaMatlamat,
    FAQ: SakaFAQ,
    Closing: SakaClosing,
  },
  'penyakit-misteri': {
    Hero: PenyakitMisteriHero,
    Problem: PenyakitMisteriProblem,
    Matlamat: PenyakitMisteriMatlamat,
    FAQ: PenyakitMisteriFAQ,
    Closing: PenyakitMisteriClosing,
  },
  'gangguan-mistik': {
    Hero: PenyakitMisteriHero,
    Problem: PenyakitMisteriProblem,
    Matlamat: PenyakitMisteriMatlamat,
    FAQ: PenyakitMisteriFAQ,
    Closing: PenyakitMisteriClosing,
  },
  'gangguan-berulang': {
    Hero: GangguanBerulangHero,
    Problem: GangguanBerulangProblem,
    Matlamat: GangguanBerulangMatlamat,
    FAQ: GangguanBerulangFAQ,
    Closing: GangguanBerulangClosing,
  },
  'belum-zuriat': {
    Hero: BelumZuriatHero,
    Problem: BelumZuriatProblem,
    Matlamat: BelumZuriatMatlamat,
    FAQ: BelumZuriatFAQ,
    Closing: BelumZuriatClosing,
  },
  'kedai-tutup': {
    Hero: KedaiTutupHero,
    Problem: KedaiTutupProblem,
    Matlamat: KedaiTutupMatlamat,
    FAQ: KedaiTutupFAQ,
    Closing: KedaiTutupClosing,
  },
};

export default function Home() {
  const [activeSlug, setActiveSlug] = useState(null);
  const [loadingSlug, setLoadingSlug] = useState(true);

  useEffect(() => {
    // Fetch the active homepage slug from settings
    fetch('/api/settings/homepage')
      .then(r => r.json())
      .then(json => {
        setActiveSlug(json.slug || null);
      })
      .catch(() => setActiveSlug(null))
      .finally(() => setLoadingSlug(false));
  }, []);

  // Determine which components to render
  const variant = activeSlug ? VARIANT_MAP[activeSlug] : null;
  const ActiveHero = variant?.Hero || HeroSection;
  const ActiveProblem = variant?.Problem || ProblemSection;
  const ActiveMatlamat = variant?.Matlamat || MatlamatSection;
  const ActiveFAQ = variant?.FAQ || FAQSection;
  const ActiveClosing = variant?.Closing || ClosingSection;

  // Show minimal loader only on first paint
  if (loadingSlug) {
    return (
      <main style={{ minHeight: '100vh', background: '#042E23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FDE047', fontFamily: 'sans-serif', fontSize: '1rem', opacity: 0.7 }}>Memuatkan...</div>
      </main>
    );
  }

  // No active slug → render proper company homepage
  if (!activeSlug) {
    return <ESyifaaHomepage />;
  }

  // Active slug set → render salespage variant as before
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>
      <ActiveHero />
      <TestimonialSection />
      <ActiveProblem />
      <FearsSection />
      <ActiveMatlamat />
      <TestimonialPart2Section />
      <CTASection />
      <PricingSection />
      <GuaranteeSection />
      <ProcessSection />
      <ApplicationForm />
      <ActiveFAQ />
      <ActiveClosing />

      <footer style={{ background: '#021812', color: '#FFFFFF', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid rgba(254, 243, 199, 0.15)' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.05rem', color: '#FEF3C7' }}>
            ESyifaa · Rawatan Jarak Jauh Gangguan Jin, Sihir, Santau &amp; Saka
          </p>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.8rem', color: '#D1D5DB' }}>
            © {new Date().getFullYear()} ESyifaa. Hak cipta terpelihara. Rawatan berasaskan bacaan Al-Quran dan doa berlandaskan syarak.
          </p>
        </div>
      </footer>
    </main>
  );
}



'use client';

import HeroSection from '@/components/salespage/variants/belum-zuriat/HeroSection';
import TestimonialSection from '@/components/salespage/TestimonialSection';
import ProblemSection from '@/components/salespage/variants/belum-zuriat/ProblemSection';
import FearsSection from '@/components/salespage/FearsSection';
import MatlamatSection from '@/components/salespage/variants/belum-zuriat/MatlamatSection';
import ProcessSection from '@/components/salespage/ProcessSection';
import TestimonialPart2Section from '@/components/salespage/TestimonialPart2Section';
import CTASection from '@/components/salespage/CTASection';
import PricingSection from '@/components/salespage/PricingSection';
import GuaranteeSection from '@/components/salespage/GuaranteeSection';
import ApplicationForm from '@/components/salespage/ApplicationForm';
import FAQSection from '@/components/salespage/variants/belum-zuriat/FAQSection';
import ClosingSection from '@/components/salespage/variants/belum-zuriat/ClosingSection';
import PageViewTracker from '@/components/salespage/PageViewTracker';
import MarketerPixelProvider from '@/components/salespage/MarketerPixelProvider';

export default function BelumZuriatPage() {

  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>
      <PageViewTracker slug="belum-zuriat" />
      <MarketerPixelProvider />
      {/* SECTION 1: HERO BANNER */}
      <HeroSection />

      {/* SECTION 2: TESTIMONI PART 1 */}
      <TestimonialSection />

      {/* SECTION 3: MASALAH */}
      <ProblemSection />

      {/* SECTION 4: FEARS */}
      <FearsSection />

      {/* SECTION 6: MATLAMAT RAWATAN */}
      <MatlamatSection />

      {/* SECTION 7: TESTIMONI PART 2 */}
      <TestimonialPart2Section />

      {/* SECTION 8: CTA & PAKEJ */}
      <CTASection />

      {/* SECTION 9: HARGA */}
      <PricingSection />

      {/* SECTION 9B: JAMINAN */}
      <GuaranteeSection />

      {/* SECTION 10: PROSES RAWATAN + BORANG DIAGNOS (combined flow) */}
      <ProcessSection />
      <ApplicationForm />

      {/* SECTION 11: SOALAN LAZIM (FAQ) */}
      <FAQSection />

      {/* SECTION 12: PENUTUP */}
      <ClosingSection />

      {/* Footer */}
      <footer style={{ background: '#021812', color: '#FFFFFF', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid rgba(254, 243, 199, 0.15)' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.05rem', color: '#FEF3C7' }}>
            Ã°Å¸Å’Â¿ ESyifaa Ã‚Â· Rawatan Jarak Jauh Gangguan Jin, Sihir, Santau &amp; Saka
          </p>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.8rem', color: '#D1D5DB' }}>
            Ã‚Â© {new Date().getFullYear()} ESyifaa. Hak cipta terpelihara. Rawatan berasaskan bacaan Al-Quran dan doa berlandaskan syarak.
          </p>
        </div>
      </footer>
    </main>
  );
}



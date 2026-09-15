'use client';
import HeroSection from '@/components/salespage/variants/sihir/HeroSection';
import TestimonialSection from '@/components/salespage/TestimonialSection';
import ProblemSection from '@/components/salespage/variants/sihir/ProblemSection';
import FearsSection from '@/components/salespage/FearsSection';
import MatlamatSection from '@/components/salespage/variants/sihir/MatlamatSection';
import TestimonialPart2Section from '@/components/salespage/TestimonialPart2Section';
import CTASection from '@/components/salespage/CTASection';
import PricingSection from '@/components/salespage/PricingSection';
import GuaranteeSection from '@/components/salespage/GuaranteeSection';
import ProcessSection from '@/components/salespage/ProcessSection';
import ApplicationForm from '@/components/salespage/ApplicationForm';
import FAQSection from '@/components/salespage/variants/sihir/FAQSection';
import ClosingSection from '@/components/salespage/variants/sihir/ClosingSection';
import PageViewTracker from '@/components/salespage/PageViewTracker';
import MarketerPixelProvider from '@/components/salespage/MarketerPixelProvider';

export default function SihirPage() {

  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>
      <PageViewTracker slug="sihir" />
      <MarketerPixelProvider slug="sihir" />
      <HeroSection />
      <TestimonialSection />
      <ProblemSection />
      <FearsSection />
      <MatlamatSection />
      <TestimonialPart2Section />
      <CTASection />
      <PricingSection />
      <GuaranteeSection />
      <ProcessSection />
      <ApplicationForm />
      <FAQSection />
      <ClosingSection />
      <footer style={{ background: '#021812', color: '#FFFFFF', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid rgba(254, 243, 199, 0.15)' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.05rem', color: '#FEF3C7' }}>
            ESyifaa Ã‚Â· Rawatan Jarak Jauh Gangguan Jin, Sihir, Santau & Saka
          </p>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.8rem', color: '#D1D5DB' }}>
            Ã‚Â© {new Date().getFullYear()} ESyifaa. Hak cipta terpelihara. Rawatan berasaskan bacaan Al-Quran dan doa berlandaskan syarak.
          </p>
        </div>
      </footer>
    </main>
  );
}



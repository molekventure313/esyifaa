// ─── Angle-specific components (rawat sendiri — berhenti bergantung pada perawat)
import RawatSendiriHeroSection from '@/components/salespage/pengisian-v2/HeroSection';
import RawatSendiriProblemSection from '@/components/salespage/pengisian-v2/ProblemSection';
import RawatSendiriFearsSection from '@/components/salespage/pengisian-v2/FearsSection';
import RawatSendiriGoalsSection from '@/components/salespage/pengisian-v2/GoalsSection';
import RawatSendiriComparisonSection from '@/components/salespage/pengisian-v2/ComparisonSection';
import RawatSendiriClosingSection from '@/components/salespage/pengisian-v2/ClosingSection';

// ─── Shared components (dikongsi dengan /pengisian-esyifa)
import FspTestimonialSection from '@/components/salespage/fsp/TestimonialSection';
import FspTestimonialPart2Section from '@/components/salespage/fsp/TestimonialPart2Section';
import PengisianExpertSection from '@/components/salespage/pengisian/ExpertSection';
import PengisianSolutionSection from '@/components/salespage/pengisian/SolutionSection';
import PengisianHowItWorksSection from '@/components/salespage/pengisian/HowItWorksSection';
import PengisianProcessSection from '@/components/salespage/pengisian/ProcessSection';
import PengisianPaymentSection from '@/components/salespage/pengisian/PaymentSection';
import PengisianGuaranteeSection from '@/components/salespage/pengisian/GuaranteeSection';
import PengisianCheckoutForm from '@/components/salespage/pengisian/PengisianCheckoutForm';
import PengisianFAQSection from '@/components/salespage/pengisian/FAQSection';

export const metadata = {
  title: "Berhenti Bergantung Pada Perawat — Rawat Diri Sendiri Dengan Pengisian E-Syifa' | RM90",
  description: "Dah penat habis ribuan ringgit berjumpa perawat? Pengisian E-Syifa' beri anda kuasa merawat diri dan keluarga sendiri — bila-bila masa, tanpa bergantung pada sesiapa. RM90 sahaja.",
};

/**
 * /rawat-sendiri — Versi 2 Pengisian E-Syifa'
 * Angle: "Dah penat habis ribuan ringgit pergi merawat,
 *         berhenti bergantung pada perawat & mula merawat diri sendiri"
 *
 * Section order:
 * #1  Hero (v2 — hook baru)
 * #2  Testimoni (shared)
 * #3  Problem (v2 — 5 masalah bergantung perawat)
 * #4  Fears (v2 — ketakutan dependency)
 * #5  Expert (shared — kredibiliti ESyifaa)
 * #6  Solution (shared — apa itu pengisian)
 * #7  HowItWorks (shared — cara kerja)
 * #8  Goals (v2 — rawat sendiri, lindungi keluarga)
 * #9  Testimoni2 (shared)
 * #10 Comparison (v2 — sebelum/selepas ada pengisian)
 * #11 Process (shared — 4 langkah)
 * #12 Payment (shared — RM90 + countdown)
 * #13 Guarantee (shared — jaminan)
 * ──── [BORANG FPX CHECKOUT — RM90] ────
 * #14 FAQ (shared)
 * #15 Closing (v2 — "selesaikan kebergantungan anda")
 */
export default function RawatSendiriPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      <RawatSendiriHeroSection />
      <FspTestimonialSection />
      <RawatSendiriProblemSection />
      <RawatSendiriFearsSection />
      <PengisianExpertSection />
      <PengisianSolutionSection />
      <PengisianHowItWorksSection />
      <RawatSendiriGoalsSection />
      <FspTestimonialPart2Section />
      <RawatSendiriComparisonSection />
      <PengisianProcessSection />
      <PengisianPaymentSection />
      <PengisianGuaranteeSection />
      <PengisianCheckoutForm />
      <PengisianFAQSection />
      <RawatSendiriClosingSection />

      <footer style={{
        background: '#021812', color: '#FFFFFF',
        padding: '2rem 1rem', textAlign: 'center',
        fontSize: '0.85rem', borderTop: '1px solid rgba(254,243,199,0.15)',
        fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.05rem', color: '#FEF3C7' }}>
            ESyifaa · Pengisian Ayat Ruqyah Jarak Jauh
          </p>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.8rem', color: '#D1D5DB' }}>
            © {new Date().getFullYear()} ESyifaa. Hak cipta terpelihara. Rawatan berasaskan bacaan Al-Quran dan doa berlandaskan syarak.
          </p>
        </div>
      </footer>

    </main>
  );
}

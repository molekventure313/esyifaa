import PengisianHeroSection from '@/components/salespage/pengisian/HeroSection';
import FspTestimonialSection from '@/components/salespage/fsp/TestimonialSection';
import PengisianProblemSection from '@/components/salespage/pengisian/ProblemSection';
import PengisianFearsSection from '@/components/salespage/pengisian/FearsSection';
import PengisianExpertSection from '@/components/salespage/pengisian/ExpertSection';
import PengisianSolutionSection from '@/components/salespage/pengisian/SolutionSection';
import PengisianHowItWorksSection from '@/components/salespage/pengisian/HowItWorksSection';
import PengisianGoalsSection from '@/components/salespage/pengisian/GoalsSection';
import FspTestimonialPart2Section from '@/components/salespage/fsp/TestimonialPart2Section';
import PengisianComparisonSection from '@/components/salespage/pengisian/ComparisonSection';
import PengisianProcessSection from '@/components/salespage/pengisian/ProcessSection';
import PengisianPaymentSection from '@/components/salespage/pengisian/PaymentSection';
import PengisianGuaranteeSection from '@/components/salespage/pengisian/GuaranteeSection';
import PengisianCheckoutForm from '@/components/salespage/pengisian/PengisianCheckoutForm';
import PengisianFAQSection from '@/components/salespage/pengisian/FAQSection';
import PengisianClosingSection from '@/components/salespage/pengisian/ClosingSection';

export const metadata = {
  title: "Pengisian E-Syifa' — Isi Barang Anda Dengan Ayat Ruqyah | RM90 via FPX",
  description: 'Perawat ESyifaa buat pengisian ayat ruqyah jarak jauh pada barang anda (cincin, tasbih, dll) selama 7 hari. Pelarasan setiap minggu percuma selamanya. Bayar RM90 via FPX.',
};

/**
 * Pengisian Ayat Ruqyah — Servis Pengisian Pada Barang Pesakit
 * Route: /pengisian-esyifa (redirect dari /tasbih-esyifa)
 *
 * Section order — 100% ikut FSP framework:
 * #1  Hero · #2  Testimoni · #3  Problem · #4  Fears · #5  Expert
 * #6  Solution · #7  HowItWorks · #8  Goals · #9  Testimoni2
 * #10 Comparison · #11 Process · #12 Payment · #13 Jaminan
 * ──── [BORANG FPX CHECKOUT — RM90] ────
 * #14 FAQ · #15 Closing
 */
export default function PengisianEsyifaPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      <PengisianHeroSection />
      <FspTestimonialSection />
      <PengisianProblemSection />
      <PengisianFearsSection />
      <PengisianExpertSection />
      <PengisianSolutionSection />
      <PengisianHowItWorksSection />
      <PengisianGoalsSection />
      <FspTestimonialPart2Section />
      <PengisianComparisonSection />
      <PengisianProcessSection />
      <PengisianPaymentSection />
      <PengisianGuaranteeSection />
      <PengisianCheckoutForm />
      <PengisianFAQSection />
      <PengisianClosingSection />

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

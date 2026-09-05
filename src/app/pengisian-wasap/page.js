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
import WACtaSection from '@/components/salespage/pengisian-wasap/WACtaSection';
import PengisianFAQSection from '@/components/salespage/pengisian/FAQSection';
import PengisianClosingSection from '@/components/salespage/pengisian/ClosingSection';

export const metadata = {
  title: "Pengisian E-Syifa' — Isi Barang Anda Dengan Ayat Ruqyah Syar'iyyah | RM90",
  description: "Perawat ESyifaa buat pengisian ayat ruqyah jarak jauh pada barang anda (cincin, tasbih, dll) selama 3 hari berturut-turut. Pelarasan setiap minggu percuma selamanya.",
};

/**
 * /pengisian-wasap — Versi Lead (WhatsApp-only)
 * Semua section sama seperti /pengisian-esyifa
 * KECUALI: PengisianCheckoutForm diganti WACtaSection (WA button, bukan FPX)
 * Tracking: Lead pixel (set tracking_type='lead' dalam DB untuk slug ini)
 *
 * SQL untuk DB:
 * INSERT INTO salespages (slug, tracking_type) VALUES ('pengisian-wasap', 'lead')
 * ON CONFLICT (slug) DO UPDATE SET tracking_type = 'lead';
 */
export default function PengisianWasapPage() {
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
      <WACtaSection />
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

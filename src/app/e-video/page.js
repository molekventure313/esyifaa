// ─── E-Video specific components
import EVideoHeroSection from '@/components/salespage/e-video/HeroSection';
import EVideoProblemSection from '@/components/salespage/e-video/ProblemSection';
import EVideoSolutionSection from '@/components/salespage/e-video/SolutionSection';
import EVideoHowItWorksSection from '@/components/salespage/e-video/HowItWorksSection';
import EVideoGoalsSection from '@/components/salespage/e-video/GoalsSection';
import EVideoComparisonSection from '@/components/salespage/e-video/ComparisonSection';
import EVideoProcessSection from '@/components/salespage/e-video/ProcessSection';
import EVideoPaymentSection from '@/components/salespage/e-video/PaymentSection';
import EVideoCheckoutForm from '@/components/salespage/e-video/EVideoCheckoutForm';
import EVideoFAQSection from '@/components/salespage/e-video/FAQSection';
import EVideoClosingSection from '@/components/salespage/e-video/ClosingSection';
import FspRuqyahTestSection from '@/components/salespage/fsp/RuqyahTestSection';

// ─── Shared components
import FspTestimonialSection from '@/components/salespage/fsp/TestimonialSection';
import FspTestimonialPart2Section from '@/components/salespage/fsp/TestimonialPart2Section';
import PengisianFearsSection from '@/components/salespage/pengisian/FearsSection';
import PengisianExpertSection from '@/components/salespage/pengisian/ExpertSection';
import PengisianGuaranteeSection from '@/components/salespage/pengisian/GuaranteeSection';

export const metadata = {
  title: "E-Video Rawatan Ruqyah — Perawat Peribadi Dalam Telefon Anda | RM150",
  description: "Dapatkan rakaman video ruqyah syar'iyyah ESyifaa. Rawat diri sendiri, lindungi rumah, buat air tawar & garam — bila-bila masa, tanpa bergantung pada perawat. RM150 sekali, guna seumur hidup.",
};

/**
 * /e-video — Produk Digital: E-Video Rawatan Ruqyah
 * Angle: Rakaman video ruqyah untuk rawatan diri, rumah, air tawar, garam, bisa
 * Harga: RM150 via FPX | Video dihantar via WhatsApp dalam 24 jam
 *
 * Section order:
 * #1  Hero (new — perawat peribadi dalam telefon)
 * #2  Testimoni (shared fsp)
 * #3  Problem (new — 5 had rawatan biasa)
 * #4  Fears (shared pengisian — rasa helpless)
 * #5  Expert (shared pengisian — autoriti ESyifaa)
 * #6  Solution (new — apa itu E-Video & cara ia berfungsi)
 * #7  HowItWorks (new — 5 kegunaan video)
 * #8  Goals (new — 5 perubahan selepas ada E-Video)
 * #9  Testimoni 2 (shared fsp)
 * #10 Comparison (new — E-Video vs Rawatan Biasa vs Pengisian)
 * #11 Process (new — 3 langkah: Bayar → WA → Guna)
 * #12 Payment (new — RM150 price card)
 * #13 Guarantee (shared pengisian)
 * ──── [CHECKOUT FORM FPX RM150] ────
 * #14 FAQ (new — E-Video specific)
 * #15 Closing (new)
 */
export default function EVideoPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      {/* #1 — Hero */}
      <EVideoHeroSection />

      {/* #2 — Testimoni Part 1 */}
      <FspTestimonialSection />

      {/* #3 — Problem (5 had rawatan biasa) */}
      <EVideoProblemSection />

      {/* #4 — Fears (shared) */}
      <PengisianFearsSection />

      {/* #5 — Expert / Authority */}
      <PengisianExpertSection />

      {/* #6 — Solution (apa itu E-Video) */}
      <EVideoSolutionSection />

      {/* #7 — HowItWorks (5 kegunaan video) */}
      <EVideoHowItWorksSection />

      {/* #8 — Goals (selepas ada E-Video) */}
      <EVideoGoalsSection />

      {/* #9 — Testimoni Part 2 */}
      <FspTestimonialPart2Section />

      {/* #10 — Comparison (E-Video vs alternatives) */}
      <EVideoComparisonSection />

      {/* #11 — Process (3 langkah) */}
      <EVideoProcessSection />

      {/* #12 — Payment (RM150 price card) */}
      <EVideoPaymentSection />

      {/* #13 — Guarantee (shared) */}
      <PengisianGuaranteeSection />

      {/* #13b — Masih Ragu? Cuba Sendiri — Video Ruqyah + Air + Tindak Balas */}
      <FspRuqyahTestSection />

      {/* BORANG FPX CHECKOUT — RM150 */}
      <EVideoCheckoutForm />

      {/* #14 — FAQ (E-Video specific) */}
      <EVideoFAQSection />

      {/* #15 — Closing */}
      <EVideoClosingSection />

      <footer style={{
        background: '#021812', color: '#FFFFFF',
        padding: '2rem 1rem', textAlign: 'center',
        fontSize: '0.85rem', borderTop: '1px solid rgba(254,243,199,0.15)',
        fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.05rem', color: '#FEF3C7' }}>
            ESyifaa · E-Video Rawatan Ruqyah Syar&apos;iyyah
          </p>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.8rem', color: '#D1D5DB' }}>
            © {new Date().getFullYear()} ESyifaa. Hak cipta terpelihara. Rawatan berasaskan bacaan Al-Quran dan doa berlandaskan syarak.
          </p>
        </div>
      </footer>

    </main>
  );
}

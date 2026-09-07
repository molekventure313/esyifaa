import SabunHeroSection from '@/components/salespage/sabun-garam/HeroSection';
import SabunTestimonialSection from '@/components/salespage/sabun-garam/TestimonialSection';
import SabunProblemSection from '@/components/salespage/sabun-garam/ProblemSection';
import SabunFearsSection from '@/components/salespage/sabun-garam/FearsSection';
import SabunSolutionSection from '@/components/salespage/sabun-garam/SolutionSection';
import SabunFungsiElemenSection from '@/components/salespage/sabun-garam/FungsiElemenSection';
import SabunGoalsSection from '@/components/salespage/sabun-garam/GoalsSection';
import SabunHowToUseSection from '@/components/salespage/sabun-garam/HowToUseSection';
import SabunTestimonialPart2Section from '@/components/salespage/sabun-garam/TestimonialPart2Section';
import SabunComparisonSection from '@/components/salespage/sabun-garam/ComparisonSection';
import SabunCheckoutForm from '@/components/salespage/sabun-garam/SabunCheckoutForm';
import FspGuaranteeSection from '@/components/salespage/fsp/GuaranteeSection';
import SabunFAQSection from '@/components/salespage/sabun-garam/FAQSection';
import SabunClosingSection from '@/components/salespage/sabun-garam/ClosingSection';
import FloatingWAButton from '@/components/salespage/pengisian/FloatingWAButton';

/**
 * Sabun Garam Himalaya Pengisian — Salespage
 * Route: /sabun-garam
 *
 * Section order (FSP 15-section framework — complete):
 * #01  Hero Banner
 * #02  Testimoni Part 1
 * #03  Problems (6 simptom)
 * #04  Fears (akibat jika tidak dirawat)          ← added
 * #05  Solution (apa itu sabun pengisian)
 * #06  Fungsi Elemen (garam himalaya + ruqyah)    ← added
 * #07  Goals (5 perubahan selepas guna)           ← added
 * #08  Cara Guna (3 langkah)
 * #09  Testimoni Part 2
 * #10  Perbandingan (sabun biasa vs pengisian)
 * #11  Borang Tempahan (3 pakej + FPX/COD)
 * #12  Jaminan 30 hari
 * #13  FAQ
 * #14  Closing CTA
 */
export default function SabunGaramPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      {/* #01 — Hero Banner */}
      <SabunHeroSection />

      {/* #02 — Testimoni Part 1 */}
      <SabunTestimonialSection />

      {/* #03 — Masalah / Simptom */}
      <SabunProblemSection />

      {/* #04 — Fears (akibat jika tidak dirawat) */}
      <SabunFearsSection />

      {/* #05 — Penyelesaian (apa itu sabun pengisian) */}
      <SabunSolutionSection />

      {/* #06 — Fungsi Elemen (garam himalaya + ruqyah) */}
      <SabunFungsiElemenSection />

      {/* #07 — Goals (5 perubahan kehidupan) */}
      <SabunGoalsSection />

      {/* #08 — Cara Guna (3 langkah) */}
      <SabunHowToUseSection />

      {/* #09 — Testimoni Part 2 */}
      <SabunTestimonialPart2Section />

      {/* #10 — Perbandingan */}
      <SabunComparisonSection />

      {/* #11 — Borang Tempahan (3 Pakej + FPX/COD) */}
      <SabunCheckoutForm source="sabun-garam" />

      {/* #12 — Jaminan */}
      <FspGuaranteeSection />

      {/* #13 — FAQ */}
      <SabunFAQSection />

      {/* #14 — Closing */}
      <SabunClosingSection />

      {/* Floating WA help button */}
      <FloatingWAButton pretext="Assalamualaikum, saya nak tanya pasal Sabun Garam Himalaya Pengisian ESyifaa" />

      {/* Footer */}
      <footer style={{ background: '#010E09', color: '#4B5563', padding: '1.75rem 1rem', textAlign: 'center', fontSize: '0.78rem', lineHeight: 1.6 }}>
        © {new Date().getFullYear()} ESyifaa. Produk berasaskan ruqyah syar&apos;iyyah. Tiada unsur syirik.
      </footer>

    </main>
  );
}

import SabunHeroSection from '@/components/salespage/sabun-garam/HeroSection';
import SabunTestimonialSection from '@/components/salespage/sabun-garam/TestimonialSection';
import SabunProblemSection from '@/components/salespage/sabun-garam/ProblemSection';
import SabunSolutionSection from '@/components/salespage/sabun-garam/SolutionSection';
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
 * Section order (FSP format adapted for physical product):
 * #1  Hero
 * #2  Testimoni Part 1 (placeholder)
 * #3  Problem (6 simptom)
 * #4  Penyelesaian (apa itu sabun pengisian)
 * #5  Cara Guna (3 langkah)
 * #6  Testimoni Part 2 (placeholder)
 * #7  Perbandingan (sabun biasa vs pengisian)
 * #8  Borang (3 pakej + FPX/COD)
 * #9  Jaminan
 * #10 FAQ
 * #11 Closing CTA
 */
export default function SabunGaramPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      {/* #1 — Hero */}
      <SabunHeroSection />

      {/* #2 — Testimoni Part 1 */}
      <SabunTestimonialSection />

      {/* #3 — Masalah / Simptom */}
      <SabunProblemSection />

      {/* #4 — Penyelesaian */}
      <SabunSolutionSection />

      {/* #5 — Cara Guna */}
      <SabunHowToUseSection />

      {/* #6 — Testimoni Part 2 */}
      <SabunTestimonialPart2Section />

      {/* #7 — Perbandingan */}
      <SabunComparisonSection />

      {/* #8 — Borang Tempahan (3 Pakej + FPX/COD) */}
      <SabunCheckoutForm source="sabun-garam" />

      {/* #9 — Jaminan */}
      <FspGuaranteeSection />

      {/* #10 — FAQ */}
      <SabunFAQSection />

      {/* #11 — Closing */}
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

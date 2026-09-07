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
 * Shared page content for all Sabun Garam Himalaya variants.
 * Only the Hero Banner differs between variants — all other sections are identical.
 *
 * Props:
 * - heroHeadline   {ReactNode|string} — H1 headline text (FSP formula: testimonial result + 3 masalah)
 * - heroSubheadline {string}          — H4 description (what prospek will EXPERIENCE)
 * - source         {string}           — tracking source for checkout (e.g. 'sabun-garam-1')
 */
export default function SabunGaramPageContent({
  heroHeadline,
  heroSubheadline,
  source = 'sabun-garam',
}) {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      {/* #01 — Hero Banner (variant-specific) */}
      <SabunHeroSection headline={heroHeadline} subheadline={heroSubheadline} />

      {/* #02 — Testimoni Part 1 */}
      <SabunTestimonialSection />

      {/* #03 — Masalah / Simptom */}
      <SabunProblemSection />

      {/* #04 — Fears */}
      <SabunFearsSection />

      {/* #05 — Penyelesaian */}
      <SabunSolutionSection />

      {/* #06 — Fungsi Elemen */}
      <SabunFungsiElemenSection />

      {/* #07 — Goals */}
      <SabunGoalsSection />

      {/* #08 — Cara Guna */}
      <SabunHowToUseSection />

      {/* #09 — Testimoni Part 2 */}
      <SabunTestimonialPart2Section />

      {/* #10 — Perbandingan */}
      <SabunComparisonSection />

      {/* #11 — Borang Tempahan (source varies per variant) */}
      <SabunCheckoutForm source={source} />

      {/* #12 — Jaminan */}
      <FspGuaranteeSection />

      {/* #13 — FAQ */}
      <SabunFAQSection />

      {/* #14 — Closing */}
      <SabunClosingSection />

      {/* Floating WA help button */}
      <FloatingWAButton pretext="Assalamualaikum, saya nak tanya pasal Sabun Garam Himalaya Pengisian ESyifaa" />

      <footer style={{ background: '#010E09', color: '#4B5563', padding: '1.75rem 1rem', textAlign: 'center', fontSize: '0.78rem', lineHeight: 1.6 }}>
        © {new Date().getFullYear()} ESyifaa. Produk berasaskan ruqyah syar&apos;iyyah. Tiada unsur syirik.
      </footer>

    </main>
  );
}

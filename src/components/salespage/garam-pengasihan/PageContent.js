'use client';

import AnnouncementBar from '@/components/salespage/garam-pengasihan/AnnouncementBar';
import GaramHeroSection from '@/components/salespage/garam-pengasihan/HeroSection';
import GaramTestimonialSection from '@/components/salespage/garam-pengasihan/TestimonialSection';
import GaramProblemSection from '@/components/salespage/garam-pengasihan/ProblemSection';
import GaramFearsSection from '@/components/salespage/garam-pengasihan/FearsSection';
import GaramAuthoritySection from '@/components/salespage/garam-pengasihan/AuthoritySection';
import GaramSolutionSection from '@/components/salespage/garam-pengasihan/SolutionSection';
import GaramBenefitsSection from '@/components/salespage/garam-pengasihan/BenefitsSection';
import GaramFungsiElemenSection from '@/components/salespage/garam-pengasihan/FungsiElemenSection';
import GaramGoalsSection from '@/components/salespage/garam-pengasihan/GoalsSection';
import GaramHowToUseSection from '@/components/salespage/garam-pengasihan/HowToUseSection';
import GaramTestimonialPart2Section from '@/components/salespage/garam-pengasihan/TestimonialPart2Section';
import GaramComparisonSection from '@/components/salespage/garam-pengasihan/ComparisonSection';
import GaramGuaranteeSection from '@/components/salespage/garam-pengasihan/GuaranteeSection';
import GaramCheckoutForm from '@/components/salespage/garam-pengasihan/GaramCheckoutForm';
import WhatsAppOrderSection from '@/components/salespage/WhatsAppOrderSection';
import GaramFAQSection from '@/components/salespage/garam-pengasihan/FAQSection';
import GaramClosingSection from '@/components/salespage/garam-pengasihan/ClosingSection';
import FloatingWAButton from '@/components/salespage/pengisian/FloatingWAButton';
import MarketerPixelProvider from '@/components/salespage/MarketerPixelProvider';

export default function GaramPengasihanPageContent({ source = 'garam-pengasihan' }) {
  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A' }}>
      <MarketerPixelProvider />

      {/* #01 — Announcement Bar */}
      <AnnouncementBar />

      {/* #02 — Hero Banner */}
      <GaramHeroSection />

      {/* #03 — Testimoni Part 1 */}
      <GaramTestimonialSection />

      {/* #04 — 6 Masalah / Agitation */}
      <GaramProblemSection />

      {/* #05 — Fears (Akibat Melarat) */}
      <GaramFearsSection />

      {/* #06 — Authority / Dalil Al-Quran & Sunnah */}
      <GaramAuthoritySection />

      {/* #07 — Solution (Intro Produk) */}
      <GaramSolutionSection />

      {/* #08 — 8 Manfaat Menyeluruh */}
      <GaramBenefitsSection />

      {/* #09 — Fungsi Elemen & Cara Bertindak */}
      <GaramFungsiElemenSection />

      {/* #10 — Goals (Kehidupan Selepas Guna) */}
      <GaramGoalsSection />

      {/* #11 — Cara Guna Mudah */}
      <GaramHowToUseSection />

      {/* #12 — Testimoni Part 2 */}
      <GaramTestimonialPart2Section />

      {/* #13 — Perbandingan & COD Info */}
      <GaramComparisonSection />

      {/* #14 — Jaminan 30 Hari */}
      <GaramGuaranteeSection />

      {/* #15 — Borang Tempahan FPX & COD */}
      <GaramCheckoutForm source={source} />

      {/* Kad Tempahan Melalui WhatsApp (Selepas Form, Sebelum FAQ) */}
      <WhatsAppOrderSection product="Garam Pengasihan Masakan" background="#FFF7ED" />

      {/* #16 — FAQ 7 Soalan Lazim */}
      <GaramFAQSection />

      {/* #17 — Closing Emosional */}
      <GaramClosingSection />

      {/* Floating WhatsApp Help Button */}
      <FloatingWAButton
        pretext="Assalamualaikum ustaz, saya nak tanya tentang Garam Pengasihan Masakan ESyifaa untuk masalah rumahtangga saya."
      />

      {/* Footer */}
      <footer style={{
        background: '#1E293B',
        color: '#94A3B8',
        padding: '2.5rem 1rem',
        textAlign: 'center',
        fontSize: '0.84rem',
        lineHeight: 1.65,
        borderTop: '1px solid #334155',
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: '#F1F5F9', fontSize: '0.98rem' }}>
            ESyifaa · Garam Pengasihan Masakan Ruqyah Syar&apos;iyyah
          </p>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} ESyifaa. Ikhtiar berasaskan Al-Quran &amp; Sunnah. Tiada unsur khurafat, syirik mahupun tangkal. Hak cipta terpelihara.
          </p>
        </div>
      </footer>

    </main>
  );
}

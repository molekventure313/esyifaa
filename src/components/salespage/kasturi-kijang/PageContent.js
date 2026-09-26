'use client';

import AnnouncementBar from '@/components/salespage/kasturi-kijang/AnnouncementBar';
import KasturiHeroSection from '@/components/salespage/kasturi-kijang/HeroSection';
import KasturiTestimonialSection from '@/components/salespage/kasturi-kijang/TestimonialSection';
import KasturiProblemSection from '@/components/salespage/kasturi-kijang/ProblemSection';
import KasturiFearsSection from '@/components/salespage/kasturi-kijang/FearsSection';
import KasturiAuthoritySection from '@/components/salespage/kasturi-kijang/AuthoritySection';
import KasturiSolutionSection from '@/components/salespage/kasturi-kijang/SolutionSection';
import KasturiBenefitsSection from '@/components/salespage/kasturi-kijang/BenefitsSection';
import KasturiFungsiElemenSection from '@/components/salespage/kasturi-kijang/FungsiElemenSection';
import KasturiGoalsSection from '@/components/salespage/kasturi-kijang/GoalsSection';
import KasturiHowToUseSection from '@/components/salespage/kasturi-kijang/HowToUseSection';
import KasturiTestimonialPart2Section from '@/components/salespage/kasturi-kijang/TestimonialPart2Section';
import KasturiComparisonSection from '@/components/salespage/kasturi-kijang/ComparisonSection';
import KasturiGuaranteeSection from '@/components/salespage/kasturi-kijang/GuaranteeSection';
import KasturiCheckoutForm from '@/components/salespage/kasturi-kijang/KasturiCheckoutForm';
import KasturiFAQSection from '@/components/salespage/kasturi-kijang/FAQSection';
import KasturiClosingSection from '@/components/salespage/kasturi-kijang/ClosingSection';
import FloatingWAButton from '@/components/salespage/pengisian/FloatingWAButton';
import WhatsAppOrderSection from '@/components/salespage/WhatsAppOrderSection';
import MarketerPixelProvider from '@/components/salespage/MarketerPixelProvider';

export default function KasturiKijangPageContent({ source = 'kasturi-kijang' }) {
  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A' }}>
      <MarketerPixelProvider />

      {/* #01 — Announcement Bar */}
      <AnnouncementBar />

      {/* #02 — Hero Banner */}
      <KasturiHeroSection />

      {/* #03 — Testimoni Part 1 */}
      <KasturiTestimonialSection />

      {/* #04 — 6 Masalah / Agitation */}
      <KasturiProblemSection />

      {/* #05 — Fears (Akibat Melarat) */}
      <KasturiFearsSection />

      {/* #06 — Authority / Dalil Al-Quran & Hadith */}
      <KasturiAuthoritySection />

      {/* #07 — Solution (Intro Produk) */}
      <KasturiSolutionSection />

      {/* #08 — 8 Manfaat Menyeluruh */}
      <KasturiBenefitsSection />

      {/* #09 — Fungsi Elemen & Cara Bertindak */}
      <KasturiFungsiElemenSection />

      {/* #10 — Goals (Kehidupan Selepas Guna) */}
      <KasturiGoalsSection />

      {/* #11 — Cara Guna Mudah */}
      <KasturiHowToUseSection />

      {/* #12 — Testimoni Part 2 */}
      <KasturiTestimonialPart2Section />

      {/* #13 — Perbandingan & COD Info */}
      <KasturiComparisonSection />

      {/* #14 — Jaminan 30 Hari */}
      <KasturiGuaranteeSection />

      {/* #15 — Borang Tempahan FPX & COD */}
      <KasturiCheckoutForm source={source} />

      {/* Order melalui WhatsApp (no. HQ / no. marketer; tersembunyi kalau marketer belum isi) */}
      <WhatsAppOrderSection product="Minyak Kasturi Kijang" background="#FFFFFF" />

      {/* #16 — FAQ 7 Soalan Lazim */}
      <KasturiFAQSection />

      {/* #17 — Closing Emosional */}
      <KasturiClosingSection />

      {/* Floating WhatsApp Help Button */}
      <FloatingWAButton
        pretext="Assalamualaikum ustaz, saya nak tanya tentang Minyak Kasturi Kijang Ruqyah E-Syifa' untuk masalah gangguan & ketenangan tidur saya."
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
            E-Syifa&apos; · Minyak Kasturi Kijang Asli Ruqyah Syar&apos;iyyah
          </p>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} E-Syifa&apos;. Ikhtiar berasaskan Sunnah &amp; Ruqyah Syar&apos;iyyah. Tiada unsur syirik mahupun khurafat. Hak cipta terpelihara.
          </p>
        </div>
      </footer>

    </main>
  );
}

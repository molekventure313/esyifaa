import PengisianAnnouncementBar from '@/components/salespage/pengisian/AnnouncementBar';
import PengisianHeroSection from '@/components/salespage/pengisian/HeroSection';
import PengisianTestimonialSection from '@/components/salespage/pengisian/TestimonialSection';
import PengisianProblemSection from '@/components/salespage/pengisian/ProblemSection';
import PengisianFearsSection from '@/components/salespage/pengisian/FearsSection';
import PengisianExpertSection from '@/components/salespage/pengisian/ExpertSection';
import PengisianSolutionSection from '@/components/salespage/pengisian/SolutionSection';
import PengisianItemsSection from '@/components/salespage/pengisian/ItemsSection';
import PengisianHowItWorksSection from '@/components/salespage/pengisian/HowItWorksSection';
import PengisianGoalsSection from '@/components/salespage/pengisian/GoalsSection';
import PengisianHowToUseSection from '@/components/salespage/pengisian/HowToUseSection';
import PengisianProcessSection from '@/components/salespage/pengisian/ProcessSection';
import PengisianTestimonialPart2Section from '@/components/salespage/pengisian/TestimonialPart2Section';
import PengisianComparisonSection from '@/components/salespage/pengisian/ComparisonSection';
import PengisianGuaranteeSection from '@/components/salespage/pengisian/GuaranteeSection';
import PengisianPaymentSection from '@/components/salespage/pengisian/PaymentSection';
import PengisianCheckoutForm from '@/components/salespage/pengisian/PengisianCheckoutForm';
import PengisianFAQSection from '@/components/salespage/pengisian/FAQSection';
import PengisianClosingSection from '@/components/salespage/pengisian/ClosingSection';
import FloatingWAButton from '@/components/salespage/pengisian/FloatingWAButton';
import MarketerPixelProvider from '@/components/salespage/MarketerPixelProvider';

export const metadata = {
  title: "Pengisian E-Syifa' — Ikhtiar Gangguan Jin & Sihir Berulang | Siap 3 Hari Tanpa Pos",
  description: "Pasakkan 4 lapisan ayat Ruqyah Syar'iyyah pada cincin, tasbih atau barang peribadi anda secara jarak jauh. Rawat diri sendiri 24 jam di rumah. Pelarasan mingguan percuma selamanya.",
  keywords: "pengisian esyifa, rawatan ruqyah jarak jauh, cincin ruqyah, tasbih ruqyah, sihir berulang, gangguan jin, rawat sendiri",
};

export default function PengisianEsyifaPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A' }}>
      <MarketerPixelProvider />

      {/* #01 — Announcement Bar */}
      <PengisianAnnouncementBar />

      {/* #02 — Hero Banner */}
      <PengisianHeroSection />

      {/* #03 — Testimoni Part 1 */}
      <PengisianTestimonialSection />

      {/* #04 — 6 Masalah (Problems) */}
      <PengisianProblemSection />

      {/* #05 — Fears (Akibat Melarat & Hadith Darah) */}
      <PengisianFearsSection />

      {/* #06 — Authority (Dalil Al-Quran & Kredibiliti Perawat) */}
      <PengisianExpertSection />

      {/* #07 — Solution (Intro Pengisian & 10 Manfaat) */}
      <PengisianSolutionSection />

      {/* #08 — Pilihan Barang Yang Boleh Diisi (Items Section) */}
      <PengisianItemsSection />

      {/* #09 — Fungsi Elemen (4 Lapisan Ayat Ruqyah & Pelarasan) */}
      <PengisianHowItWorksSection />

      {/* #10 — Goals (5 Transformasi Hidup) */}
      <PengisianGoalsSection />

      {/* #11 — Cara Guna Item Bila Diserang */}
      <PengisianHowToUseSection />

      {/* #12 — Aliran Proses Pengisian 3 Hari */}
      <PengisianProcessSection />

      {/* #13 — Testimoni Part 2 (Gelombang Kedua) */}
      <PengisianTestimonialPart2Section />

      {/* #14 — Perbandingan Langsung (Pengisian vs Air vs Luar) */}
      <PengisianComparisonSection />

      {/* #15 — Jaminan 30 Hari Tanpa Risiko */}
      <PengisianGuaranteeSection />

      {/* #16 — Pakej & Urgensi Slot Promo */}
      <PengisianPaymentSection />

      {/* #17 — Borang Tempahan FPX Bertingkat (Volume Offer + Addon) */}
      <PengisianCheckoutForm source="pengisian-esyifa" />

      {/* FAQ 8 Soalan Lazim */}
      <PengisianFAQSection />

      {/* Penutup Emosional */}
      <PengisianClosingSection />

      {/* Floating WhatsApp Help Button */}
      <FloatingWAButton group="pengisian" />

      {/* Footer Tema Cerah & Kemas */}
      <footer style={{
        background: '#F8FAFC', color: '#475569',
        padding: '3rem 1rem', textAlign: 'center',
        fontSize: '0.85rem', borderTop: '1px solid #E2E8F0',
        fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.05rem', color: '#042E23' }}>
            ESyifaa · Pengisian Ayat Ruqyah Syar&apos;iyyah Jarak Jauh
          </p>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.82rem', color: '#64748B' }}>
            © {new Date().getFullYear()} ESyifaa. Hak cipta terpelihara. Rawatan berasaskan bacaan Al-Quran dan doa berlandaskan syarak. Tiada unsur khurafat atau jin.
          </p>
        </div>
      </footer>

    </main>
  );
}

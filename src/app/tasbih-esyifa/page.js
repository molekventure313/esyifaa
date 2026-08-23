import PengisianHeroSection from '@/components/salespage/pengisian/HeroSection';
import FspTestimonialSection from '@/components/salespage/fsp/TestimonialSection';
import PengisianProblemSection from '@/components/salespage/pengisian/ProblemSection';
import PengisianItemsSection from '@/components/salespage/pengisian/ItemsSection';
import PengisianHowItWorksSection from '@/components/salespage/pengisian/HowItWorksSection';
import FspTestimonialPart2Section from '@/components/salespage/fsp/TestimonialPart2Section';
import PengisianProcessSection from '@/components/salespage/pengisian/ProcessSection';
import PengisianPaymentSection from '@/components/salespage/pengisian/PaymentSection';
import FspGuaranteeSection from '@/components/salespage/fsp/GuaranteeSection';
import PengisianCheckoutForm from '@/components/salespage/pengisian/PengisianCheckoutForm';
import PengisianFAQSection from '@/components/salespage/pengisian/FAQSection';
import PengisianClosingSection from '@/components/salespage/pengisian/ClosingSection';

export const metadata = {
  title: 'ESyifaa — Pengisian Ayat Ruqyah Pada Barang Anda | RM90 via FPX',
  description: 'Perawat ESyifaa buat pengisian ayat ruqyah jarak jauh pada barang anda (cincin, tasbih, dll) selama 7 hari. Pelarasan setiap minggu percuma selamanya. Bayar RM90 via FPX.',
};

/**
 * Pengisian Ayat Ruqyah — Servis Pengisian Pada Barang Pesakit
 * Route: /tasbih-esyifa
 *
 * Section order:
 * #1  Hero — Pengisian Ayat Ruqyah
 * #2  Testimoni Part 1
 * #3  Problem (kenapa perlukan barang berisian)
 * #4  Jenis Barang (apa yang boleh diisi)
 * #5  Apa Yang Diisi (4 lapisan ayat + pelarasan mingguan)
 * #6  Testimoni Part 2
 * #7  Proses (4 langkah tempahan)
 * #8  Payment (pakej RM90)
 * #9  Jaminan
 * [BORANG CHECKOUT FPX — RM90]
 * #10 FAQ
 * Closing
 */
export default function TasbihEsyifaPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      {/* #1 — Hero */}
      <PengisianHeroSection />

      {/* #2 — Testimoni Part 1 */}
      <FspTestimonialSection />

      {/* #3 — Problem */}
      <PengisianProblemSection />

      {/* #4 — Jenis Barang Yang Boleh Diisi */}
      <PengisianItemsSection />

      {/* #5 — Apa Yang Diisi (4 Lapisan Ayat + Pelarasan Mingguan) */}
      <PengisianHowItWorksSection />

      {/* #6 — Testimoni Part 2 */}
      <FspTestimonialPart2Section />

      {/* #7 — Proses Tempahan (4 Langkah) */}
      <PengisianProcessSection />

      {/* #8 — Payment (Pakej RM90) */}
      <PengisianPaymentSection />

      {/* #9 — Jaminan Pulang Wang */}
      <FspGuaranteeSection />

      {/* BORANG DIRECT FPX CHECKOUT — RM90 */}
      <PengisianCheckoutForm />

      {/* #10 — FAQ */}
      <PengisianFAQSection />

      {/* Closing */}
      <PengisianClosingSection />

      {/* Footer */}
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

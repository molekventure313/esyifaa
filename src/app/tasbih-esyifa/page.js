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
 * Section order — 100% ikut FSP framework:
 *
 * #1  Hero — Hook + Solution callout
 * #2  Testimoni Part 1 ← social proof terus selepas hero
 * #3  Problem (6 masalah — kenapa rawatan luar tidak cukup)
 * #4  Fears (6 akibat jika tidak diselesaikan)
 * #5  Expert/Authority (Dalil Al-Quran & Hadith)
 * #6  Solution (Perkenalkan Pengisian E-Syifa' + 10 manfaat)
 * #7  HowItWorks (4 lapisan ayat yang diisikan)
 * #8  Goals (5 perubahan selepas dapat pengisian)
 * #9  Testimoni Part 2 ← reinforce sebelum push ke payment
 * #10 Comparison (vs Air Penawar vs Rawatan Luar)
 * #11 Process (4 langkah: Tempah → Perawat → 7 Hari → Guna)
 * #12 Payment (Pakej RM90)
 * #13 Jaminan
 * ──── [BORANG FPX CHECKOUT — RM90]
 * #14 FAQ
 * #15 Closing
 */
export default function TasbihEsyifaPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      {/* #1 — Hero */}
      <PengisianHeroSection />

      {/* #2 — Testimoni Part 1 */}
      <FspTestimonialSection />

      {/* #3 — Problem (6 masalah) */}
      <PengisianProblemSection />

      {/* #4 — Fears (6 akibat jika tidak dirawat) */}
      <PengisianFearsSection />

      {/* #5 — Expert / Authority (Dalil Al-Quran & Hadith) */}
      <PengisianExpertSection />

      {/* #6 — Solution (Perkenalkan Pengisian E-Syifa' + 10 manfaat) */}
      <PengisianSolutionSection />

      {/* #7 — Apa Yang Diisi (4 Lapisan Ayat Ruqyah) */}
      <PengisianHowItWorksSection />

      {/* #8 — Goals (5 Perubahan Selepas Pengisian) */}
      <PengisianGoalsSection />

      {/* #9 — Testimoni Part 2 */}
      <FspTestimonialPart2Section />

      {/* #10 — Comparison (vs Air Penawar vs Rawatan Luar) */}
      <PengisianComparisonSection />

      {/* #11 — Proses Tempahan (4 Langkah) */}
      <PengisianProcessSection />

      {/* #12 — Payment (Pakej RM90) */}
      <PengisianPaymentSection />

      {/* #13 — Jaminan */}
      <FspGuaranteeSection />

      {/* BORANG DIRECT FPX CHECKOUT — RM90 */}
      <PengisianCheckoutForm />

      {/* #14 — FAQ */}
      <PengisianFAQSection />

      {/* #15 — Closing */}
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

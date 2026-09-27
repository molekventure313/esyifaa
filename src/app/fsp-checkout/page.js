import FspHeroSection from '@/components/salespage/fsp/HeroSection';
import FspTestimonialSection from '@/components/salespage/fsp/TestimonialSection';
import FspProblemSection from '@/components/salespage/fsp/ProblemSection';
import FspFearsSection from '@/components/salespage/fsp/FearsSection';
import FspExpertSection from '@/components/salespage/fsp/ExpertSection';
import FspSolutionSection from '@/components/salespage/fsp/SolutionSection';
import FspMethodSection from '@/components/salespage/fsp/MethodSection';
import FspGoalsSection from '@/components/salespage/fsp/GoalsSection';
import FspTestimonialPart2Section from '@/components/salespage/fsp/TestimonialPart2Section';
import FspProcessSection from '@/components/salespage/fsp/ProcessSection';
import FspPaymentSection from '@/components/salespage/fsp/PaymentSection';
import FspGuaranteeSection from '@/components/salespage/fsp/GuaranteeSection';
import FspRuqyahTestSection from '@/components/salespage/fsp/RuqyahTestSection';
import FspChipCheckoutForm from '@/components/salespage/fsp/FspChipCheckoutForm';
import FspFAQSection from '@/components/salespage/fsp/FAQSection';
import FspClosingSection from '@/components/salespage/fsp/ClosingSection';

export const metadata = {
  title: 'ESyifaa — Rawatan Gangguan Jin, Sihir & Saka | Bayar Terus RM50 FPX',
  description: 'Rawatan jarak jauh 100% patuh syariah untuk gangguan jin, sihir, saka & penyakit misteri. Bayar terus RM50 melalui FPX — perawat hubungi anda segera.',
};

/**
 * FSP Direct FPX Checkout — Bayar Terus RM50
 * Route: /fsp-checkout
 *
 * Section order ikut FSP10 framework (Elementor original):
 *
 * #1  Hero Banner
 * #2  Testimoni Part 1  ← social proof terus selepas hero
 * #3  Problem (6 masalah)
 * #4  Fears (akibat jika tidak dirawat)
 * #5  Expert / Authority (dalil Al-Quran & Hadith)
 * #6  Solution (ESyifaa intro + 10 manfaat)
 * #7  Method (kaedah rawatan 4 elemen)
 * #8  Goals (5 perubahan selepas rawatan)
 * #9  Testimoni Part 2  ← reinforce sebelum push ke payment
 * #10 Process (4 langkah: Bayar → Perawat → Rawatan → Susulan)
 * #11 Payment Info (FPX + QR cara bayar)
 * #12 Jaminan (guarantee + refund)
 * #13 Masih ragu? Air Tawar percuma
 * #14 CTA + Pakej (Bayar RM50)
 * ──── [CHECKOUT FORM] ← hampir akhir, selepas semua convincing sections
 * #15 WhatsApp CTA
 * #16 FAQ
 * Closing
 */
export default function FspCheckoutPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#042E23' }}>

      {/* #1 — Hero Banner */}
      <FspHeroSection />

      {/* #2 — Testimoni Part 1 (social proof terus selepas hero) */}
      <FspTestimonialSection />

      {/* #3 — Problems */}
      <FspProblemSection />

      {/* #4 — Fears (Akibat Jika Tidak Dirawat) */}
      <FspFearsSection />

      {/* #5 — Pakar / Authority (Dalil Al-Quran & Hadith) */}
      <FspExpertSection />

      {/* #6 — Solution (Perkenalkan ESyifaa + 10 Manfaat) */}
      <FspSolutionSection />

      {/* #7 — Kaedah Rawatan (4 Elemen) */}
      <FspMethodSection />

      {/* #8 — Goals (5 Perubahan Selepas Rawatan) */}
      <FspGoalsSection />

      {/* #9 — Testimoni Part 2 (reinforce sebelum push ke payment) */}
      <FspTestimonialPart2Section />

      {/* #10 — Cara Rawatan (4 Langkah: Bayar → Perawat → Rawatan → Susulan) */}
      <FspProcessSection />

      {/* #11 — Cara Bayar FPX + QR */}
      <FspPaymentSection />

      {/* #12 — Jaminan Pulang Wang */}
      <FspGuaranteeSection />

      {/* #13 — Masih Ragu? Cuba Sendiri — Video Ruqyah + Air + Tindak Balas */}
      <FspRuqyahTestSection />

      {/* BORANG DIRECT FPX CHECKOUT — terus selepas jaminan */}
      <FspChipCheckoutForm source="fsp-checkout" />

      {/* #15 — Soalan Lazim */}
      <FspFAQSection />

      {/* Closing */}
      <FspClosingSection />

      {/* Footer */}
      <footer style={{
        background: '#021812', color: '#FFFFFF',
        padding: '2rem 1rem', textAlign: 'center',
        fontSize: '0.85rem', borderTop: '1px solid rgba(254, 243, 199, 0.15)'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.05rem', color: '#FEF3C7' }}>
            ESyifaa · Rawatan Jarak Jauh Gangguan Jin, Sihir, Santau & Saka
          </p>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.8rem', color: '#D1D5DB' }}>
            © {new Date().getFullYear()} ESyifaa. Hak cipta terpelihara. Rawatan berasaskan bacaan Al-Quran dan doa berlandaskan syarak.
          </p>
        </div>
      </footer>

    </main>
  );
}

import MarketerPixelProvider from '@/components/salespage/MarketerPixelProvider';
import WhatsAppOrderSection from '@/components/salespage/WhatsAppOrderSection';
import AirTawarTrialSection from '@/components/salespage/pengisian/AirTawarTrialSection';
import { HQ_WHATSAPP_PENGISIAN } from '@/components/salespage/useSalesContact';
import RuqyahHarianCheckout from '@/components/salespage/ruqyah-harian/CheckoutForm';
import {
  AnnouncementBar, Hero, Testimonials, Problems, Fears, Authority, Solution,
  Elements, Goals, HowItWorks, Guarantee, FAQ, Closing,
} from '@/components/salespage/ruqyah-harian/Sections';

// SP Ruqyah Harian E-Syifa — servis langganan (Framework FSP 10%)
export default function RuqyahHarianPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A' }}>
      <MarketerPixelProvider />
      <AnnouncementBar />          {/* #1 */}
      <Hero />                     {/* #2 */}
      <Testimonials part={1} />    {/* #3 — placeholder */}
      <Problems />                 {/* #4 */}
      <Fears />                    {/* #5 — angle A2 */}
      <Authority />                {/* #6 */}
      <Solution />                 {/* #7 + #8 */}
      <Elements />                 {/* #9 */}
      <Goals />                    {/* #10 */}
      <HowItWorks />               {/* #11 */}
      <Testimonials part={2} />    {/* #12 — placeholder */}
      <Guarantee />                {/* #14 */}
      <RuqyahHarianCheckout />     {/* #13 + #15 */}
      <AirTawarTrialSection background="linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)" />
      <WhatsAppOrderSection product="Ruqyah Harian E-Syifa" background="#F0FDF4" hqNumber={HQ_WHATSAPP_PENGISIAN} />  {/* #16 */}
      <FAQ />                      {/* #17 */}
      <Closing />
      <footer style={{ background: '#021812', color: '#94A3B8', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontFamily: 'var(--font-inter), -apple-system, sans-serif' }}>
        © {new Date().getFullYear()} E-Syifa&apos; · Ruqyah Syar&apos;iyyah berasaskan Al-Quran &amp; Sunnah. Kesembuhan hanya daripada Allah SWT.
      </footer>
    </main>
  );
}

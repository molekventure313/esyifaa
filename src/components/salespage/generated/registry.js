// Section HQ (dikunci) untuk setiap produk SP Generator — terus guna komponen SP HQ.
// Testimoni, fakta, harga, borang checkout (stok & source order) kekal sama seperti SP HQ.
// Slot tiada dalam senarai produk = tidak dipapar untuk produk itu.

import WhatsAppOrderSection from '@/components/salespage/WhatsAppOrderSection';
import { HQ_WHATSAPP_SABUN, HQ_WHATSAPP_PENGISIAN } from '@/components/salespage/useSalesContact';

// Sabun Garam
import SabunTestimonialSection from '@/components/salespage/sabun-garam/TestimonialSection';
import SabunTestimonialPart2Section from '@/components/salespage/sabun-garam/TestimonialPart2Section';
import SabunFungsiElemenSection from '@/components/salespage/sabun-garam/FungsiElemenSection';
import SabunHowToUseSection from '@/components/salespage/sabun-garam/HowToUseSection';
import SabunComparisonSection from '@/components/salespage/sabun-garam/ComparisonSection';
import SabunGuaranteeSection from '@/components/salespage/sabun-garam/GuaranteeSection';
import SabunCheckoutForm from '@/components/salespage/sabun-garam/SabunCheckoutForm';
import SabunFAQSection from '@/components/salespage/sabun-garam/FAQSection';

// Kasturi Kijang
import KasturiTestimonialSection from '@/components/salespage/kasturi-kijang/TestimonialSection';
import KasturiTestimonialPart2Section from '@/components/salespage/kasturi-kijang/TestimonialPart2Section';
import KasturiAuthoritySection from '@/components/salespage/kasturi-kijang/AuthoritySection';
import KasturiFungsiElemenSection from '@/components/salespage/kasturi-kijang/FungsiElemenSection';
import KasturiHowToUseSection from '@/components/salespage/kasturi-kijang/HowToUseSection';
import KasturiComparisonSection from '@/components/salespage/kasturi-kijang/ComparisonSection';
import KasturiGuaranteeSection from '@/components/salespage/kasturi-kijang/GuaranteeSection';
import KasturiCheckoutForm from '@/components/salespage/kasturi-kijang/KasturiCheckoutForm';
import KasturiFAQSection from '@/components/salespage/kasturi-kijang/FAQSection';

// Garam Pengasihan
import GaramTestimonialSection from '@/components/salespage/garam-pengasihan/TestimonialSection';
import GaramTestimonialPart2Section from '@/components/salespage/garam-pengasihan/TestimonialPart2Section';
import GaramAuthoritySection from '@/components/salespage/garam-pengasihan/AuthoritySection';
import GaramFungsiElemenSection from '@/components/salespage/garam-pengasihan/FungsiElemenSection';
import GaramHowToUseSection from '@/components/salespage/garam-pengasihan/HowToUseSection';
import GaramComparisonSection from '@/components/salespage/garam-pengasihan/ComparisonSection';
import GaramGuaranteeSection from '@/components/salespage/garam-pengasihan/GuaranteeSection';
import GaramCheckoutForm from '@/components/salespage/garam-pengasihan/GaramCheckoutForm';
import GaramFAQSection from '@/components/salespage/garam-pengasihan/FAQSection';

// Pengisian E-Syifa
import PengisianTestimonialSection from '@/components/salespage/pengisian/TestimonialSection';
import PengisianTestimonialPart2Section from '@/components/salespage/pengisian/TestimonialPart2Section';
import PengisianExpertSection from '@/components/salespage/pengisian/ExpertSection';
import PengisianItemsSection from '@/components/salespage/pengisian/ItemsSection';
import PengisianHowItWorksSection from '@/components/salespage/pengisian/HowItWorksSection';
import PengisianHowToUseSection from '@/components/salespage/pengisian/HowToUseSection';
import PengisianComparisonSection from '@/components/salespage/pengisian/ComparisonSection';
import PengisianGuaranteeSection from '@/components/salespage/pengisian/GuaranteeSection';
import PengisianCheckoutForm from '@/components/salespage/pengisian/PengisianCheckoutForm';
import PengisianFAQSection from '@/components/salespage/pengisian/FAQSection';

// Ruqyah Harian
import RuqyahHarianCheckout from '@/components/salespage/ruqyah-harian/CheckoutForm';
import {
  Testimonials as RhTestimonials, Authority as RhAuthority, Elements as RhElements,
  HowItWorks as RhHowItWorks, Guarantee as RhGuarantee, FAQ as RhFAQ,
} from '@/components/salespage/ruqyah-harian/Sections';

// Rawatan Jarak Jauh RM50 (FSP checkout)
import FspTestimonialSection from '@/components/salespage/fsp/TestimonialSection';
import FspTestimonialPart2Section from '@/components/salespage/fsp/TestimonialPart2Section';
import FspExpertSection from '@/components/salespage/fsp/ExpertSection';
import FspMethodSection from '@/components/salespage/fsp/MethodSection';
import FspProcessSection from '@/components/salespage/fsp/ProcessSection';
import FspGuaranteeSection from '@/components/salespage/fsp/GuaranteeSection';
import FspChipCheckoutForm from '@/components/salespage/fsp/FspChipCheckoutForm';
import FspFAQSection from '@/components/salespage/fsp/FAQSection';

// source = sama dengan SP HQ → stok, laporan produk & label order kekal betul
export const HQ_SLOTS = {
  'sabun-garam': {
    testimoni1: () => <SabunTestimonialSection />,
    fungsi:     () => <SabunFungsiElemenSection />,
    howto:      () => <SabunHowToUseSection />,
    testimoni2: () => <SabunTestimonialPart2Section />,
    comparison: () => <SabunComparisonSection />,
    guarantee:  () => <SabunGuaranteeSection />,
    checkout:   () => <SabunCheckoutForm source="sabun-garam" />,
    whatsapp:   () => <WhatsAppOrderSection product="Sabun Garam Himalaya" background="#F8FAF9" hqNumber={HQ_WHATSAPP_SABUN} />,
    faq:        () => <SabunFAQSection />,
  },
  'kasturi-kijang': {
    testimoni1: () => <KasturiTestimonialSection />,
    authority:  () => <KasturiAuthoritySection />,
    fungsi:     () => <KasturiFungsiElemenSection />,
    howto:      () => <KasturiHowToUseSection />,
    testimoni2: () => <KasturiTestimonialPart2Section />,
    comparison: () => <KasturiComparisonSection />,
    guarantee:  () => <KasturiGuaranteeSection />,
    checkout:   () => <KasturiCheckoutForm source="kasturi-kijang" />,
    whatsapp:   () => <WhatsAppOrderSection product="Minyak Kasturi Kijang" background="#FFFFFF" />,
    faq:        () => <KasturiFAQSection />,
  },
  'garam-pengasihan': {
    testimoni1: () => <GaramTestimonialSection />,
    authority:  () => <GaramAuthoritySection />,
    fungsi:     () => <GaramFungsiElemenSection />,
    howto:      () => <GaramHowToUseSection />,
    testimoni2: () => <GaramTestimonialPart2Section />,
    comparison: () => <GaramComparisonSection />,
    guarantee:  () => <GaramGuaranteeSection />,
    checkout:   () => <GaramCheckoutForm source="garam-pengasihan" />,
    whatsapp:   () => <WhatsAppOrderSection product="Garam Pengasihan Masakan" background="#FFF7ED" />,
    faq:        () => <GaramFAQSection />,
  },
  'pengisian-esyifa': {
    testimoni1: () => <PengisianTestimonialSection />,
    authority:  () => <PengisianExpertSection />,
    extra:      () => <PengisianItemsSection />,
    fungsi:     () => <PengisianHowItWorksSection />,
    howto:      () => <PengisianHowToUseSection />,
    testimoni2: () => <PengisianTestimonialPart2Section />,
    comparison: () => <PengisianComparisonSection />,
    guarantee:  () => <PengisianGuaranteeSection />,
    checkout:   () => <PengisianCheckoutForm source="pengisian-esyifa" />,
    whatsapp:   () => <WhatsAppOrderSection product="Pengisian E-Syifa" background="#F0FDF4" hqNumber={HQ_WHATSAPP_PENGISIAN} />,
    faq:        () => <PengisianFAQSection />,
  },
  'ruqyah-harian': {
    testimoni1: () => <RhTestimonials part={1} />,
    authority:  () => <RhAuthority />,
    fungsi:     () => <RhElements />,
    howto:      () => <RhHowItWorks />,
    testimoni2: () => <RhTestimonials part={2} />,
    guarantee:  () => <RhGuarantee />,
    checkout:   () => <RuqyahHarianCheckout />,
    whatsapp:   () => <WhatsAppOrderSection product="Ruqyah Harian E-Syifa" background="#F0FDF4" hqNumber={HQ_WHATSAPP_PENGISIAN} />,
    faq:        () => <RhFAQ />,
  },
  rawatan: {
    testimoni1: () => <FspTestimonialSection />,
    authority:  () => <FspExpertSection />,
    fungsi:     () => <FspMethodSection />,
    howto:      () => <FspProcessSection />,
    testimoni2: () => <FspTestimonialPart2Section />,
    guarantee:  () => <FspGuaranteeSection />,
    checkout:   () => <FspChipCheckoutForm source="fsp-checkout" />,
    whatsapp:   () => <WhatsAppOrderSection product="Rawatan Jarak Jauh E-Syifa" background="#F0FDF4" />,
    faq:        () => <FspFAQSection />,
  },
};

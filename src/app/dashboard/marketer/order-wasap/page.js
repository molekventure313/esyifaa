'use client';

import WhatsAppOrderForm from '@/components/dashboard/WhatsAppOrderForm';

// Marketer — order WhatsApp masuk sebagai order marketer ini
export default function MarketerWhatsAppOrderPage() {
  return <WhatsAppOrderForm scopeLabel="dalam Gaji & laporan anda" ordersHref="/dashboard/marketer/orders" />;
}

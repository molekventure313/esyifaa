'use client';

import WhatsAppOrderForm from '@/components/dashboard/WhatsAppOrderForm';

// Admin — order WhatsApp masuk sebagai order HQ
export default function AdminWhatsAppOrderPage() {
  return <WhatsAppOrderForm scopeLabel="sebagai order HQ" ordersHref="/dashboard/admin/pesakit-berbayar" />;
}

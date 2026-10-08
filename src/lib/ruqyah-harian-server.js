// Ruqyah Harian — helper server sahaja
import { RH_SOURCE, rhMonthStartISO } from '@/lib/ruqyah-harian';

/**
 * Bilangan PENDAFTARAN BARU yang dah dibayar sejak 1hb bulan semasa (MYT).
 * Sambungan langganan (no. telefon yang pernah melanggan sebelum bulan ini) TIDAK makan slot.
 */
export async function countRhSlotsUsed(admin) {
  const monthStart = rhMonthStartISO();
  const { data: thisMonth, error } = await admin.from('submissions')
    .select('phone')
    .like('source', `${RH_SOURCE}%`)
    .eq('payment_status', 'completed')
    .gte('created_at', monthStart);
  if (error) throw error;

  const phones = [...new Set((thisMonth || []).map(r => r.phone).filter(Boolean))];
  if (!phones.length) return 0;

  const { data: before } = await admin.from('submissions')
    .select('phone')
    .like('source', `${RH_SOURCE}%`)
    .eq('payment_status', 'completed')
    .lt('created_at', monthStart)
    .in('phone', phones);
  const renewing = new Set((before || []).map(r => r.phone));
  return phones.filter(p => !renewing.has(p)).length;
}

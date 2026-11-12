// Order duplikat — pelanggan sama (no. telefon) order produk fizikal yang sama dalam DUP_WINDOW_DAYS hari
// (biasanya order dua kali melalui marketer berbeza). Server sahaja. Perlu migration 043.
//   COD → auto batal (payment_status 'cancelled', stok dipulangkan) + nota "dah disubmit sebelum ini"
//   FPX / prabayar → ditanda sahaja (pelanggan dah bayar — admin semak & refund)
import { productOf } from '@/lib/products';
import { logActivity } from '@/lib/utils/logger';
import { deductOrderStock } from '@/lib/payments';

export const DUP_WINDOW_DAYS = 7;

const productKeyOf = s => productOf(s.source) || (s.payment_type === 'cod' ? 'sabun-garam' : null);

const fmtMY = iso => new Date(iso).toLocaleString('ms-MY', {
  timeZone: 'Asia/Kuala_Lumpur', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
});

/** Order terdahulu (selesai, bukan duplikat) dari telefon sama + produk sama dalam tempoh — atau null */
export async function findEarlierOrder(db, s) {
  const key = productKeyOf(s);
  if (!key || !s.phone) return null;
  const created = s.created_at ? new Date(s.created_at) : new Date();
  const from = new Date(created.getTime() - DUP_WINDOW_DAYS * 864e5).toISOString();
  const { data, error } = await db.from('submissions')
    .select('id, full_name, source, payment_type, created_at, marketer_id, order_channel')
    .eq('phone', s.phone).neq('id', s.id)
    .in('payment_type', ['cod', 'fpx_payment']).eq('payment_status', 'completed')
    .is('duplicate_of', null).is('returned_at', null)
    .gte('created_at', from).lte('created_at', created.toISOString())
    .order('created_at', { ascending: false }).limit(10);
  if (error) { console.warn('[duplicate] semakan dilangkau:', error.message); return null; }
  return (data || []).find(o => productKeyOf(o) === key) || null;
}

/**
 * Semak order baru — duplikat → batal (COD) / tanda (FPX). Tidak pernah throw (bukan penghalang order).
 * @returns {Promise<null | { earlier: object, cancelled: boolean, note: string }>}
 */
export async function handleDuplicateOrder(db, submission) {
  try {
    const earlier = await findEarlierOrder(db, submission);
    if (!earlier) return null;

    let by = 'HQ';
    if (earlier.marketer_id) {
      const { data: m } = await db.from('profiles').select('full_name').eq('id', earlier.marketer_id).maybeSingle();
      by = m?.full_name || 'marketer';
    }
    const note = `Dah disubmit sebelum ini — ${fmtMY(earlier.created_at)} oleh ${by}${earlier.order_channel === 'whatsapp' ? ' (WhatsApp)' : ''} · ${earlier.full_name}`;
    const cancel = submission.payment_type === 'cod';

    const { error } = await db.from('submissions')
      .update({ duplicate_of: earlier.id, duplicate_note: note, ...(cancel ? { payment_status: 'cancelled' } : {}) })
      .eq('id', submission.id);
    if (error) throw error;

    // COD dibatalkan → pulangkan stok yang ditolak semasa order masuk
    if (cancel) {
      await db.from('stock_movements').delete().eq('reference_id', submission.id).eq('movement_type', 'out');
    }

    try {
      await logActivity(db, {
        userId: null, actionType: cancel ? 'order_duplicate_cancelled' : 'order_duplicate_flagged',
        entityType: 'submission', entityId: submission.id,
        newValues: { duplicate_of: earlier.id, payment_status: cancel ? 'cancelled' : submission.payment_status },
        description: `🔁 Order duplikat ${submission.full_name} (${submission.phone}) ${cancel ? 'dibatalkan automatik' : 'ditanda (FPX — semak refund)'}: ${note}`,
      });
    } catch { /* log bukan penghalang */ }

    return { earlier, cancelled: cancel, note };
  } catch (e) {
    console.error('[duplicate] gagal (order tetap disimpan):', e.message);
    return null;
  }
}

/**
 * "Bukan duplikat" — buang tanda; COD yang dibatalkan dipulihkan (completed) & stok ditolak semula.
 * @returns {Promise<{ restored: boolean }>}
 */
export async function restoreDuplicate(db, id, actor, reason = '') {
  const { data: s, error } = await db.from('submissions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!s) throw new Error('Order tidak dijumpai.');
  // duplicate_of jadi NULL bila order asal dipadam (FK SET NULL) — nota duplikat masih menandakannya
  if (!s.duplicate_of && !s.duplicate_note) throw new Error('Order ini tidak bertanda duplikat.');
  const restore = s.payment_status === 'cancelled';
  const { error: upErr } = await db.from('submissions')
    .update({ duplicate_of: null, duplicate_note: null, ...(restore ? { payment_status: 'completed' } : {}) })
    .eq('id', id);
  if (upErr) throw upErr;
  if (restore) {
    try { await deductOrderStock(db, s, 'Order dipulihkan (bukan duplikat)'); }
    catch (e) { console.error('[duplicate] tolak stok semula gagal:', e.message); }
  }
  try {
    await logActivity(db, {
      userId: actor.id, actionType: 'order_duplicate_restore', entityType: 'submission', entityId: id,
      oldValues: { duplicate_of: s.duplicate_of, duplicate_note: s.duplicate_note, payment_status: s.payment_status },
      description: reason
        ? `Order ${s.full_name} (${s.phone}) ${restore ? 'dipulihkan' : 'tidak lagi bertanda duplikat'} — ${reason}`
        : `${actor.name || 'Admin'} tanda order ${s.full_name} (${s.phone}) BUKAN duplikat${restore ? ' — order dipulihkan' : ''}`,
    });
  } catch { /* */ }
  return { restored: restore };
}

/**
 * Order asal akan dipadam → pulihkan order yang dibatalkan/ditanda sebagai duplikatnya,
 * supaya pelanggan tidak hilang kedua-dua order. Panggil SEBELUM padam (FK duplicate_of jadi NULL selepas padam).
 * Order yang turut dipadam dalam kumpulan sama dilangkau. Tidak pernah throw.
 * @returns {Promise<string[]>} nama pelanggan yang dipulihkan
 */
export async function restoreDuplicatesOf(db, earlierIds, actor) {
  try {
    const { data } = await db.from('submissions').select('id, full_name').in('duplicate_of', earlierIds);
    const restored = [];
    for (const d of data || []) {
      if (earlierIds.includes(d.id)) continue;
      try {
        await restoreDuplicate(db, d.id, actor || { id: null }, `order asal (yang dirujuk sebagai duplikat) dipadam${actor?.name ? ` oleh ${actor.name}` : ''}`);
        restored.push(d.full_name);
      } catch (e) { console.error('[duplicate] pulih gagal:', d.id, e.message); }
    }
    return restored;
  } catch (e) {
    console.error('[duplicate] semak duplikat order dipadam gagal:', e.message);
    return [];
  }
}

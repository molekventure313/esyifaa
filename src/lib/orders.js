// Padam order (COD/FPX) dengan bersih — dikongsi oleh admin (single + bulk) dan marketer.
//
// Stok: buang SEMUA stock_movements yang dirujuk order ini ('out' auto-deduct + 'return'),
// supaya kesan bersih order pada stok = 0. (Buang 'out' sahaja akan pulangkan stok
// dua kali untuk order yang dah di-return.)
export async function deleteOrders(adminClient, ids) {
  if (!ids.length) return;

  // Cases dulu (FK constraint)
  await adminClient.from('cases').delete().in('submission_id', ids);

  await adminClient
    .from('stock_movements')
    .delete()
    .in('reference_id', ids)
    .in('movement_type', ['out', 'return']);

  const { error } = await adminClient.from('submissions').delete().in('id', ids);
  if (error) throw error;
}

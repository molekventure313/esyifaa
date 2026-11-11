import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { restoreDuplicate } from '@/lib/duplicates';

// PATCH /api/orders/[id]/duplicate — "Bukan duplikat": buang tanda & pulihkan order COD yang dibatalkan automatik
export async function PATCH(req, { params }) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  const { id } = await params;
  try {
    const { restored } = await restoreDuplicate(g.admin, id, { id: g.user.id, name: g.profile?.full_name });
    return NextResponse.json({ success: true, restored, message: restored ? 'Order dipulihkan — bukan duplikat.' : 'Tanda duplikat dibuang.' });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

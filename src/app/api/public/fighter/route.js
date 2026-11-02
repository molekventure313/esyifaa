import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicFighter } from '@/lib/fighter/orders';

// SP fighter — no. WhatsApp & pixel fighter ikut kod (?f=). Maklumat awam sahaja.
export async function GET(req) {
  const code = new URL(req.url).searchParams.get('f');
  try {
    const f = await publicFighter(createAdminClient(), code);
    if (!f) return NextResponse.json({ whatsapp: null, pixel_id: null }, { status: 404 });
    return NextResponse.json(f, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch {
    return NextResponse.json({ whatsapp: null, pixel_id: null }, { status: 500 });
  }
}

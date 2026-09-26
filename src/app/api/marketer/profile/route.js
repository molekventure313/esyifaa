import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateMalaysianPhone } from '@/lib/utils/phone';

async function requireMarketer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'marketer') return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 }) };
  return { user, adminClient };
}

// GET — profil marketer (nama, kod, email, no. WhatsApp SP)
export async function GET() {
  try {
    const { user, adminClient, error } = await requireMarketer();
    if (error) return error;

    const { data, error: dbErr } = await adminClient
      .from('profiles')
      .select('full_name, marketer_code, marketer_whatsapp')
      .eq('id', user.id)
      .single();
    if (dbErr) throw dbErr;

    return NextResponse.json({ success: true, data: { ...data, email: user.email } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — kemaskini no. WhatsApp SP. Kosong → null (section & butang WA disembunyikan di SP marketer)
export async function PATCH(req) {
  try {
    const { user, adminClient, error } = await requireMarketer();
    if (error) return error;

    const { marketer_whatsapp } = await req.json();
    let value = null;
    if (marketer_whatsapp && String(marketer_whatsapp).trim()) {
      const check = validateMalaysianPhone(String(marketer_whatsapp));
      if (!check.valid) {
        return NextResponse.json({ success: false, error: 'No. WhatsApp tidak sah. Contoh: 0123456789' }, { status: 400 });
      }
      value = check.formatted;
    }

    const { error: dbErr } = await adminClient
      .from('profiles')
      .update({ marketer_whatsapp: value })
      .eq('id', user.id);
    if (dbErr) throw dbErr;

    return NextResponse.json({ success: true, data: { marketer_whatsapp: value } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

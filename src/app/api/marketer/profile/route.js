import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateMalaysianPhone } from '@/lib/utils/phone';
import { activeTeamsale, spWhatsapp } from '@/lib/team';

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
      .select('id, full_name, marketer_code, marketer_whatsapp, team_leader_id')
      .eq('id', user.id)
      .single();
    if (dbErr) throw dbErr;

    // Teamsale: nombor dia dipapar di SP ketua. Ketua: SP guna nombor teamsale aktif (kalau dah isi).
    let leader = null, teamsale = null, sp = null;
    if (data.team_leader_id) {
      const { data: l } = await adminClient.from('profiles').select('full_name, is_active').eq('id', data.team_leader_id).maybeSingle();
      leader = l ? { name: l.full_name } : null;
    } else {
      const ts = await activeTeamsale(adminClient, user.id);
      const res = spWhatsapp(data, ts);
      teamsale = ts ? { name: ts.full_name, whatsapp: ts.marketer_whatsapp || null } : null;
      sp = { number: res.number, source: res.source };
    }

    return NextResponse.json({
      success: true,
      data: { ...data, email: user.email, is_teamsale: !!data.team_leader_id, leader, teamsale, sp },
    });
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

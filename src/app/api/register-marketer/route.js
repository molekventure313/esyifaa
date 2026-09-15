import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const { fullName, email, password, phone, marketerCode } = await request.json();

    if (!fullName || !email || !password || !marketerCode) {
      return Response.json(
        { error: 'Sila lengkapkan nama penuh, e-mel, kata laluan, dan kod marketer.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.' },
        { status: 400 }
      );
    }

    // Validate marketerCode format
    const marketerCodeRegex = /^[a-z0-9-]{2,20}$/;
    if (!marketerCodeRegex.test(marketerCode)) {
      return Response.json(
        { error: 'Kod Marketer hanya boleh mengandungi huruf kecil, nombor, dan sengkang (-). Panjang antara 2-20 aksara.' },
        { status: 400 }
      );
    }

    // Use shared admin client — same SUPABASE_SERVICE_ROLE_KEY as all other admin routes
    const supabaseAdmin = createAdminClient();

    // Check uniqueness of marketerCode
    const { data: existingMarketer, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('marketer_code', marketerCode)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking marketer code uniqueness:', checkError);
      return Response.json(
        { error: 'Ralat menyemak kod marketer.' },
        { status: 500 }
      );
    }

    if (existingMarketer) {
      return Response.json(
        { error: 'Kod Marketer telah digunakan. Sila pilih kod lain.' },
        { status: 400 }
      );
    }

    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'marketer'
      }
    });

    if (authError) {
      console.error('Supabase Auth Create User Error:', authError);
      return Response.json(
        { error: authError.message || 'Gagal mendaftar akaun pengguna.' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Upsert profile — is_active: false = pending approval
    // onConflict: 'id' handles case where handle_new_user trigger already created the row
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        email,
        phone: phone || null,
        role: 'marketer',
        is_active: false,           // pending admin approval
        marketer_code: marketerCode,
        marketer_basic_salary: 1700.00,
        marketer_commission_pct: 10.00,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select('id, role, is_active')
      .single();

    if (profileError) {
      console.error('Supabase Profile Upsert Error:', profileError);
      return Response.json(
        { error: profileError.message || 'Akaun dicipta tetapi profil gagal dikemaskini.' },
        { status: 500 }
      );
    }

    // Verify the upsert actually set role = 'marketer'
    if (profileData && profileData.role !== 'marketer') {
      console.error('Profile role mismatch after upsert:', profileData);
      // Force-update role separately (handles trigger overwrite scenario)
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'marketer', is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }

    return Response.json({
      success: true,
      message: 'Pendaftaran berjaya! Sila tunggu kelulusan admin sebelum login.'
    });

  } catch (error) {
    console.error('Register Marketer Route Error:', error);
    return Response.json(
      { error: 'Ralat pelayan dalaman semasa mendaftar marketer.' },
      { status: 500 }
    );
  }
}

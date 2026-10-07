import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/utils/logger';

// Pengurusan Pengguna — semua akaun sistem (admin / perawat / marketer / teamsale).
// Peraturan:
//  · Hanya super_admin boleh guna (admin = staff order)
//  · Akaun super_admin, dan pemberian role super_admin → super_admin sahaja
//  · Tak boleh tukar role / nyahaktif / padam akaun sendiri (elak terkunci keluar)

const ROLES = ['super_admin', 'admin', 'practitioner', 'marketer'];
const DEFAULT_BASIC = 1700;

class HttpError extends Error { constructor(msg, status = 400) { super(msg); this.status = status; } }
const fail = e => NextResponse.json({ success: false, error: e.message }, { status: e.status || 500 });
const normRole = r => (r === 'perawat' ? 'practitioner' : r);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new HttpError('Unauthorized', 401);
  const admin = createAdminClient();
  const { data: me } = await admin.from('profiles').select('id, role, full_name').eq('id', user.id).single();
  if (me?.role !== 'super_admin') throw new HttpError('Forbidden', 403);
  return { admin, me };
}

// Boleh pemanggil urus akaun sasaran?
function assertCanManage(me, target, { newRole } = {}) {
  if (!target) throw new HttpError('Pengguna tidak dijumpai', 404);
  const isSuper = me.role === 'super_admin';
  if (target.role === 'super_admin' && !isSuper) throw new HttpError('Hanya super admin boleh urus akaun super admin.', 403);
  if (newRole === 'super_admin' && !isSuper) throw new HttpError('Hanya super admin boleh beri role super admin.', 403);
}

// Kod marketer unik dari nama (cth: "Ahmad Faiz" → "ahmadfaiz", "ahmadfaiz2")
async function uniqueMarketerCode(admin, name) {
  const base = (String(name || 'marketer').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '').slice(0, 14)) || 'marketer';
  for (let i = 0; i < 30; i++) {
    const code = i === 0 ? base : `${base}${i + 1}`;
    const { data } = await admin.from('profiles').select('id').eq('marketer_code', code).maybeSingle();
    if (!data) return code;
  }
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

// Medan tambahan ikut role (bila cipta / tukar role)
async function roleFields(admin, role, current = {}) {
  if (role === 'marketer') {
    return {
      marketer_code: current.marketer_code || await uniqueMarketerCode(admin, current.full_name),
      marketer_basic_salary: current.marketer_basic_salary ?? DEFAULT_BASIC,
    };
  }
  if (role === 'practitioner') {
    return { max_active_cases: current.max_active_cases || 10, is_receiving_cases: current.is_receiving_cases ?? true };
  }
  return {};
}

// ── GET — senarai semua pengguna + maklumat login ─────────────────────────────
export async function GET() {
  try {
    const { admin, me } = await requireAdmin();
    const [{ data: profiles, error }, authRes] = await Promise.all([
      admin.from('profiles')
        .select('id, full_name, email, phone, role, is_active, created_at, marketer_code, team_leader_id')
        .order('created_at', { ascending: false }),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    if (error) throw error;

    const authMap = Object.fromEntries((authRes?.data?.users || []).map(u => [u.id, u]));
    const nameOf = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
    const users = (profiles || []).map(p => {
      const a = authMap[p.id];
      return {
        ...p,
        role: normRole(p.role),
        email: p.email || a?.email || null,
        last_sign_in_at: a?.last_sign_in_at || null,
        is_teamsale: p.role === 'marketer' && !!p.team_leader_id,
        team_leader_name: p.team_leader_id ? nameOf[p.team_leader_id] || null : null,
        team_size: (profiles || []).filter(x => x.team_leader_id === p.id).length,
      };
    });

    return NextResponse.json({ success: true, me: { id: me.id, role: me.role }, roles: ROLES, users });
  } catch (e) { return fail(e); }
}

// ── POST — cipta pengguna ─────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { admin, me } = await requireAdmin();
    const b = await req.json();
    const full_name = String(b.full_name || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const role = normRole(b.role);
    if (!full_name || !email || !b.password) throw new HttpError('Sila isi nama, e-mel dan kata laluan.');
    if (String(b.password).length < 6) throw new HttpError('Kata laluan mestilah sekurang-kurangnya 6 aksara.');
    if (!ROLES.includes(role)) throw new HttpError('Role tidak sah.');
    assertCanManage(me, { role: 'practitioner' }, { newRole: role });

    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email, password: b.password, email_confirm: true, user_metadata: { full_name, role },
    });
    if (authErr) throw new HttpError(authErr.message);

    const id = authData.user.id;
    const { error: profErr } = await admin.from('profiles').upsert({
      id, full_name, email, phone: b.phone || null, role, is_active: true,
      ...(await roleFields(admin, role, { full_name })),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (profErr) {
      await admin.auth.admin.deleteUser(id).catch(() => {});
      throw new Error(`Gagal simpan profil: ${profErr.message}`);
    }

    await logActivity(admin, { userId: me.id, actionType: 'user_created', entityType: 'user', entityId: id, description: `${me.full_name} cipta pengguna ${full_name} (${email}) — role ${role}` });
    return NextResponse.json({ success: true, message: `Akaun ${full_name} dicipta.` });
  } catch (e) { return fail(e); }
}

// ── PATCH — tukar role / status / nama / phone / kata laluan ──────────────────
export async function PATCH(req) {
  try {
    const { admin, me } = await requireAdmin();
    const b = await req.json();
    const { data: target } = await admin.from('profiles')
      .select('id, full_name, email, role, is_active, marketer_code, marketer_basic_salary, max_active_cases, is_receiving_cases, team_leader_id')
      .eq('id', b.id).maybeSingle();
    const newRole = b.role !== undefined ? normRole(b.role) : undefined;
    assertCanManage(me, target, { newRole });

    const isSelf = target.id === me.id;
    const update = { updated_at: new Date().toISOString() };
    const changes = [];

    if (newRole !== undefined && newRole !== normRole(target.role)) {
      if (isSelf) throw new HttpError('Tak boleh tukar role akaun sendiri.');
      if (!ROLES.includes(newRole)) throw new HttpError('Role tidak sah.');
      Object.assign(update, { role: newRole }, await roleFields(admin, newRole, target));
      if (target.role === 'marketer' && newRole !== 'marketer') {
        update.team_leader_id = null;                                                     // bukan teamsale lagi
        await admin.from('profiles').update({ team_leader_id: null }).eq('team_leader_id', target.id);   // ahli team jadi marketer biasa
      }
      changes.push(`role ${normRole(target.role)} → ${newRole}`);
    }
    if (b.is_active !== undefined && !!b.is_active !== !!target.is_active) {
      if (isSelf) throw new HttpError('Tak boleh nyahaktif akaun sendiri.');
      update.is_active = !!b.is_active;
      changes.push(b.is_active ? 'diaktifkan' : 'dinyahaktif');
    }
    if (b.full_name !== undefined && String(b.full_name).trim()) { update.full_name = String(b.full_name).trim(); changes.push('nama'); }
    if (b.phone !== undefined) { update.phone = String(b.phone || '').trim() || null; changes.push('phone'); }

    if (b.password) {
      if (String(b.password).length < 6) throw new HttpError('Kata laluan mestilah sekurang-kurangnya 6 aksara.');
      const { error } = await admin.auth.admin.updateUserById(target.id, { password: b.password });
      if (error) throw new HttpError(error.message);
      changes.push('kata laluan ditetapkan semula');
    }

    if (Object.keys(update).length > 1) {
      const { error } = await admin.from('profiles').update(update).eq('id', target.id);
      if (error) throw error;
    }
    if (update.role) {
      await admin.auth.admin.updateUserById(target.id, { user_metadata: { role: update.role } }).catch(() => {});
    }

    if (changes.length) {
      await logActivity(admin, { userId: me.id, actionType: 'user_updated', entityType: 'user', entityId: target.id, description: `${me.full_name} kemaskini ${target.full_name}: ${changes.join(', ')}` });
    }
    return NextResponse.json({ success: true, message: changes.length ? `Dikemaskini: ${changes.join(', ')}` : 'Tiada perubahan' });
  } catch (e) { return fail(e); }
}

// ── DELETE ?id= — padam akaun sepenuhnya ─────────────────────────────────────
export async function DELETE(req) {
  try {
    const { admin, me } = await requireAdmin();
    const id = new URL(req.url).searchParams.get('id');
    const { data: target } = await admin.from('profiles').select('id, full_name, email, role').eq('id', id).maybeSingle();
    assertCanManage(me, target);
    if (target.id === me.id) throw new HttpError('Tak boleh padam akaun sendiri.');

    // Lepaskan semua rujukan FK ke profiles (tiada ON DELETE) sebelum padam profil
    const now = new Date().toISOString();
    await Promise.all([
      admin.from('cases').update({ assigned_to: null, updated_at: now }).eq('assigned_to', id),
      admin.from('cases').update({ assigned_by: null, updated_at: now }).eq('assigned_by', id),
      admin.from('case_status_history').update({ changed_by: null }).eq('changed_by', id),
      admin.from('salespage_config').update({ updated_by: null }).eq('updated_by', id),
      admin.from('activity_logs').update({ user_id: null }).eq('user_id', id),   // log kekal untuk audit
    ]);
    await admin.from('case_notes').delete().eq('created_by', id);
    await admin.from('follow_ups').delete().eq('practitioner_id', id);
    if (target.role === 'marketer') {
      // Ads marketer dipadam (FK SET NULL akan jadikan ia ads HQ). Order kekal tapi jadi order HQ.
      await admin.from('ads_spend').delete().eq('marketer_id', id);
      await admin.from('marketer_pixels').delete().eq('marketer_id', id);
    }

    const { error: profErr } = await admin.from('profiles').delete().eq('id', id);
    if (profErr) throw new Error(`Gagal padam profil: ${profErr.message}`);
    const { error: authErr } = await admin.auth.admin.deleteUser(id);
    if (authErr && !/not found/i.test(authErr.message)) throw new Error(`Profil dipadam tetapi akaun login gagal dipadam: ${authErr.message}`);

    await logActivity(admin, { userId: me.id, actionType: 'user_deleted', entityType: 'user', entityId: id, description: `${me.full_name} padam pengguna ${target.full_name} (${target.email || '-'}) — role ${target.role}` });
    return NextResponse.json({ success: true, message: `Akaun ${target.full_name} dipadam.` });
  } catch (e) { return fail(e); }
}

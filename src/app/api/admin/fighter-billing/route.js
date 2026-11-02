import { NextResponse } from 'next/server';
import { guard, OWNER } from '@/lib/auth';
import { tableMissing } from '@/lib/fighter/server';
import { ledgerTotals } from '@/lib/fighter/orders';

// HQ — Bil & override Fighter (super_admin)
// GET   → setiap fighter: belum dibil, tertunggak, pecahan bulanan (unit, caj, override HQ = markup) + senarai bil
// POST  { action: 'generate', fighter_id? } → jana bil dari caj belum dibil (tiada fighter_id = semua fighter)
// PATCH { bill_id, status: 'paid' | 'unpaid', ref? } → sahkan / batal bayaran bil

const BUCKET = 'fighter-files';
const MIGRATION_MSG = 'Jadual bil fighter belum wujud — run migration 028 di Supabase.';
const monthOf = iso => new Date(new Date(iso).getTime() + 8 * 3600e3).toISOString().slice(0, 7);   // MYT
const round2 = n => Math.round(n * 100) / 100;

export async function GET() {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  try {
    const since = new Date(Date.now() - 400 * 864e5).toISOString();
    const [{ data: fighters }, { data: ledger, error: le }, { data: bills, error: be }] = await Promise.all([
      g.admin.from('profiles').select('id, full_name, marketer_code').eq('role', 'independent'),
      g.admin.from('fighter_ledger').select('fighter_id, kind, qty, markup, amount, bill_id, created_at').gte('created_at', since).limit(20000),
      g.admin.from('fighter_bills').select('id, fighter_id, bill_no, period_from, period_to, total, markup_total, status, receipt_path, paid_at, paid_ref, created_at')
        .order('created_at', { ascending: false }).limit(200),
    ]);
    if (le || be) throw new Error(tableMissing(le || be) ? MIGRATION_MSG : (le || be).message);

    const paths = (bills || []).map(b => b.receipt_path).filter(Boolean);
    const { data: signed } = paths.length ? await g.admin.storage.from(BUCKET).createSignedUrls(paths, 3600) : { data: [] };
    const urlOf = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]));
    const nameOf = Object.fromEntries((fighters || []).map(f => [f.id, `${f.full_name} (${f.marketer_code})`]));

    const byFighter = {};
    for (const f of fighters || []) byFighter[f.id] = { id: f.id, name: nameOf[f.id], rows: [], unbilledRows: [], months: {} };
    for (const r of ledger || []) {
      const f = byFighter[r.fighter_id];
      if (!f) continue;
      f.rows.push(r);
      if (!r.bill_id) f.unbilledRows.push(r);
      (f.months[monthOf(r.created_at)] ||= []).push(r);
    }
    const months = {};
    const summary = Object.values(byFighter).map(f => {
      const m = Object.fromEntries(Object.entries(f.months).map(([k, rows]) => [k, ledgerTotals(rows)]));
      for (const [k, t] of Object.entries(m)) {
        months[k] ||= { units: 0, net: 0, markup: 0 };
        months[k].units += t.units; months[k].net = round2(months[k].net + t.net); months[k].markup = round2(months[k].markup + t.markup);
      }
      return {
        id: f.id, name: f.name,
        unbilled: ledgerTotals(f.unbilledRows).net,
        outstanding: round2((bills || []).filter(b => b.fighter_id === f.id && b.status === 'unpaid').reduce((t, b) => t + Number(b.total), 0)),
        months: m,
      };
    });

    return NextResponse.json({
      success: true,
      summary,
      months,   // jumlah semua fighter ikut bulan → override HQ
      bills: (bills || []).map(b => ({ ...b, total: Number(b.total), markup_total: Number(b.markup_total), fighter_name: nameOf[b.fighter_id] || '—', receipt_url: urlOf[b.receipt_path] || null })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  try {
    const b = await req.json();
    if (b.action !== 'generate') throw new Error('Tindakan tidak sah.');
    let q = g.admin.from('fighter_ledger').select('id, fighter_id, kind, qty, markup, amount, created_at').is('bill_id', null);
    if (b.fighter_id) q = q.eq('fighter_id', b.fighter_id);
    const { data: rows, error } = await q.limit(20000);
    if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);

    const groups = {};
    for (const r of rows || []) (groups[r.fighter_id] ||= []).push(r);
    const { data: people } = await g.admin.from('profiles').select('id, marketer_code').in('id', Object.keys(groups).length ? Object.keys(groups) : ['00000000-0000-0000-0000-000000000000']);
    const codeOf = Object.fromEntries((people || []).map(p => [p.id, p.marketer_code]));

    const created = [];
    const now = new Date();
    const stamp = new Date(now.getTime() + 8 * 3600e3).toISOString().slice(2, 10).replace(/-/g, '');
    for (const [fid, list] of Object.entries(groups)) {
      const t = ledgerTotals(list);
      if (t.net <= 0) continue;   // tiada caj bersih (cth semua return) → tunggu kitaran seterusnya
      const from = list.reduce((m, r) => (r.created_at < m ? r.created_at : m), list[0].created_at);
      const { data: bill, error: e1 } = await g.admin.from('fighter_bills').insert({
        fighter_id: fid, bill_no: `FB${stamp}-${(codeOf[fid] || 'x').toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        period_from: from, period_to: now.toISOString(), total: t.net, markup_total: t.markup, created_by: g.user.id,
      }).select('id, bill_no, total').single();
      if (e1) throw e1;
      const { error: e2 } = await g.admin.from('fighter_ledger').update({ bill_id: bill.id }).in('id', list.map(r => r.id)).is('bill_id', null);
      if (e2) throw e2;
      created.push(bill);
    }
    return NextResponse.json({ success: true, created });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function PATCH(req) {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  try {
    const { bill_id, status, ref } = await req.json();
    if (!['paid', 'unpaid'].includes(status)) throw new Error('Status tidak sah.');
    const paid = status === 'paid';
    const { error } = await g.admin.from('fighter_bills').update({
      status, paid_at: paid ? new Date().toISOString() : null, paid_ref: paid ? String(ref || '').slice(0, 120) || null : null,
    }).eq('id', bill_id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

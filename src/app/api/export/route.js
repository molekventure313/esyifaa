import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCSV } from '@/lib/utils/csv';
import { logActivity } from '@/lib/utils/logger';
// Akses: super_admin sahaja — role 'admin' ialah staff order (lihat src/lib/auth.js)

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!['super_admin'].includes(profile.role)) return new NextResponse('Forbidden', { status: 403 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'customers';
    let data = [];

    if (type === 'customers') {
      const { data: res } = await supabase.from('customers').select('*');
      data = res || [];
    } else if (type === 'cases') {
      const { data: res } = await supabase.from('cases').select('*, customers(full_name, phone)');
      data = res ? res.map(r => ({ ...r, customer_name: r.customers?.full_name, customer_phone: r.customers?.phone })) : [];
    } else if (type === 'submissions') {
      const { data: res } = await supabase.from('submissions').select('*');
      data = res || [];
    } else {
      return new NextResponse('Invalid type', { status: 400 });
    }

    const csvStr = generateCSV(data);
    await logActivity({ action_type: 'export_data', entity_type: 'export', entity_id: type, user_id: user.id });
    
    return new NextResponse(csvStr, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-export-${new Date().toISOString()}.csv"`
      }
    });
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }
}

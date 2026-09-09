import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateMalaysianPhone } from '@/lib/utils/phone';
import { logActivity } from '@/lib/utils/logger';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      full_name, phone, address, quantity, units_label,
      product, amount_total, amount_base, honeypot, source,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      landing_page_url, referrer_url, fbclid,
    } = body;

    if (honeypot) {
      return NextResponse.json({ success: true, order_id: `MOCK_${Date.now()}` });
    }

    if (!full_name?.trim() || !phone?.trim() || !address?.trim()) {
      return NextResponse.json({ success: false, error: 'Sila isi nama, nombor telefon dan alamat penghantaran.' }, { status: 400 });
    }

    const phoneResult = validateMalaysianPhone(phone);
    if (!phoneResult.valid) {
      return NextResponse.json({ success: false, error: phoneResult.error || 'Nombor telefon tidak sah.' }, { status: 400 });
    }

    const formattedPhone = phoneResult.formatted;
    const cleanName = full_name.trim();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    const supabase = createAdminClient();

    // Build order label for problem field
    const problemNotes = `[COD] Produk: ${product || 'Sabun Garam Himalaya Pengisian'} | Pakej: ${units_label} | Harga: RM${amount_base} + Postage RM5 = RM${amount_total} | Alamat: ${address.trim()}`;

    // Upsert customer
    let customerId = null;
    try {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', formattedPhone)
        .maybeSingle();

      if (existing) {
        customerId = existing.id;
      } else {
        const { data: newCust } = await supabase
          .from('customers')
          .insert({ full_name: cleanName, phone: formattedPhone, problem: problemNotes, submission_count: 1, is_repeat: false, first_submission_at: new Date().toISOString() })
          .select('id')
          .single();
        if (newCust) customerId = newCust.id;
      }
    } catch (e) {
      console.warn('Customer upsert skipped:', e.message);
    }

    // Create submission with payment_type: 'cod'
    let submissionId = `cod_${Date.now()}`;
    const submissionData = {
      full_name: cleanName,
      phone: formattedPhone,
      address: address?.trim() || null,
      problem: problemNotes,
      notes: `[COD ORDER] [STATUS: completed] [AMOUNT: RM${amount_total}] [QTY: ${quantity} unit] [PRODUK: ${product || 'Sabun Garam'}]`,
      source: source || 'sabun-garam',
      payment_type: 'cod',
      payment_status: 'completed',
      amount_paid: parseFloat(amount_total) || null,
      utm_source: utm_source || null, utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null, utm_content: utm_content || null,
      utm_term: utm_term || null, landing_page_url: landing_page_url || null,
      referrer_url: referrer_url || null, fbclid: fbclid || null,
      ip_address: ip, user_agent, consent_contact: true,
    };
    if (customerId) submissionData.customer_id = customerId;

    try {
      const { data: submission, error: subErr } = await supabase
        .from('submissions')
        .insert(submissionData)
        .select()
        .single();

      if (!subErr && submission) submissionId = submission.id;
    } catch (e) {
      console.warn('COD submission DB error:', e.message);
    }

    // Log activity
    try {
      await logActivity(supabase, {
        userId: null, actionType: 'cod_order_create', entityType: 'submission', entityId: submissionId,
        newValues: { customer_id: customerId, amount: amount_total, quantity, source: source || 'sabun-garam' },
        description: `COD order oleh ${cleanName} (${formattedPhone}) — ${units_label} | RM${amount_total}`,
        ipAddress: ip,
      });
    } catch (_) {}

    return NextResponse.json({ success: true, order_id: submissionId });

  } catch (error) {
    console.error('COD Order API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Ralat berlaku. Sila cuba lagi.' }, { status: 500 });
  }
}

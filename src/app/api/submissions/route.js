import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateMalaysianPhone } from '@/lib/utils/phone';
import { logActivity } from '@/lib/utils/logger';
import { sendCAPIEvent } from '@/lib/tracking/capi';
import { sendGroupNotification, buildLeadMessage } from '@/lib/notifications/wasapbot';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      full_name,
      phone,
      appointment_session,
      address,
      state,
      problem,
      notes,
      source,
      consent_contact,
      honeypot,
      event_id,
      // UTM params
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      // Tracking
      landing_page_url,
      referrer_url,
      fbclid,
      fbp,
      fbc,
      marketer_code,
    } = body;

    // Check honeypot (spam protection)
    if (honeypot) {
      return NextResponse.json({ success: true, data: { customer_id: 'ok', case_id: 'ok' } });
    }

    // Validate required fields (full_name and phone are mandatory)
    if (!full_name || !full_name.trim() || !phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Sila isi nama penuh dan nombor telefon.' },
        { status: 400 }
      );
    }

    // Validate phone
    const phoneResult = validateMalaysianPhone(phone);
    if (!phoneResult.valid) {
      return NextResponse.json(
        { success: false, error: phoneResult.error || 'Sila masukkan nombor telefon Malaysia yang sah bermula dengan 01.' },
        { status: 400 }
      );
    }
    const formattedPhone = phoneResult.formatted;
    const cleanName = full_name.trim();
    const selectedSession = appointment_session || 'Pagi';
    const combinedProblemNotes = `[Waktu Temujanji: Sesi ${selectedSession}] ${problem ? `Simptom: ${problem}` : ''}`;

    // Extract request metadata
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    const supabase = createAdminClient();

    // ─── Resolve marketer_id ───
    let marketerId = null;
    if (marketer_code) {
      const { data: marketer } = await supabase
        .from('profiles')
        .select('id')
        .eq('marketer_code', marketer_code)
        .eq('role', 'marketer')
        .single();
      
      if (marketer) {
        marketerId = marketer.id;
      }
    }

    // ─── Check if customer already exists (repeat detection) ───
    const { data: existingCustomer, error: customerSearchError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', formattedPhone)
      .maybeSingle();

    if (customerSearchError) {
      console.error('Customer search error:', customerSearchError);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    let customerId;
    let isRepeat = false;

    if (existingCustomer) {
      // Repeat customer - update their record
      customerId = existingCustomer.id;
      isRepeat = true;

      await supabase
        .from('customers')
        .update({
          full_name: cleanName,
          address: address || existingCustomer.address || null,
          state: state || existingCustomer.state || null,
          problem: combinedProblemNotes,
          notes: notes || existingCustomer.notes || null,
          submission_count: (existingCustomer.submission_count || 1) + 1,
          is_repeat: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);
    } else {
      // New customer
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from('customers')
        .insert({
          full_name: cleanName,
          phone: formattedPhone,
          address: address || null,
          state: state || null,
          problem: combinedProblemNotes,
          notes: notes || null,
          submission_count: 1,
          is_repeat: false,
          first_submission_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (newCustomerError) throw newCustomerError;
      customerId = newCustomer.id;
    }

    // ─── Create submission record ───
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        customer_id: customerId,
        full_name: cleanName,
        phone: formattedPhone,
        address: address || null,
        state: state || null,
        problem: combinedProblemNotes,
        notes: notes || null,
        source: source || 'Direct',
        payment_type: 'appointment',   // ← Explicitly mark as appointment (non-FPX)
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        landing_page_url: landing_page_url || null,
        referrer_url: referrer_url || null,
        fbclid: fbclid || null,
        fbp: fbp || null,
        fbc: fbc || null,
        ip_address: ip,
        user_agent,
        event_id: event_id || null,
        consent_contact: consent_contact ?? true,
        marketer_id: marketerId,
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // ─── AUTOMATIC STRICT ROUND-ROBIN ROTATION AMONG ACTIVE PRACTITIONERS ───
    const { data: allProfiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, is_active, is_receiving_cases, created_at')
      .order('created_at', { ascending: true });

    if (profilesErr) {
      console.error('Error querying profiles:', profilesErr);
    }

    // Filter: only non-super_admin practitioners who are:
    //   1. is_active = true (or null) — akaun aktif
    //   2. is_receiving_cases != false — toggle menerima kes AKTIF
    // Perawat yang toggle mereka 'Tak Aktif' akan DISKIP dalam round-robin
    const activePractitioners = (allProfiles || []).filter(p => {
      const isNotSuperAdmin = p.role !== 'super_admin';
      const isAccountActive = p.is_active !== false;          // akaun tidak dinyahaktifkan
      const isReceiving    = p.is_receiving_cases !== false;  // toggle sidebar = Aktif
      return isNotSuperAdmin && isAccountActive && isReceiving;
    });

    let assignedPractitioner = null;

    if (activePractitioners.length > 0) {
      // Get the most recently assigned case (only among cases with a real assignment)
      const { data: lastAssignedCase } = await supabase
        .from('cases')
        .select('assigned_to, created_at')
        .not('assigned_to', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastAssignedCase && lastAssignedCase.assigned_to) {
        // Find where the last assigned practitioner sits in the CURRENT active list
        const lastIndex = activePractitioners.findIndex(p => p.id === lastAssignedCase.assigned_to);
        if (lastIndex !== -1) {
          // Move to next in rotation — wraps around automatically
          const nextIndex = (lastIndex + 1) % activePractitioners.length;
          assignedPractitioner = activePractitioners[nextIndex];
        } else {
          // Last assigned practitioner is now inactive/tak aktif — restart from first in list
          assignedPractitioner = activePractitioners[0];
        }
      } else {
        // No previous assignments — start with first active practitioner
        assignedPractitioner = activePractitioners[0];
      }
    }

    // NO fallback to inactive practitioners — if all are inactive, case stays unassigned ('Baru')

    const caseInitialStatus = assignedPractitioner ? 'Belum Diambil' : 'Baru';

    // ─── Create case record ───
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        customer_id: customerId,
        submission_id: submission.id,
        status: caseInitialStatus,
        assigned_to: assignedPractitioner ? assignedPractitioner.id : null,
        marketer_id: marketerId,
      })
      .select()
      .single();

    if (caseError) throw caseError;

    // Record initial status history
    await supabase.from('case_status_history').insert({
      case_id: newCase.id,
      old_status: null,
      new_status: caseInitialStatus,
      notes: assignedPractitioner 
        ? `Diagih secara automatik (Round-Robin) kepada perawat ${assignedPractitioner.full_name} [Sesi Temujanji: ${selectedSession}]`
        : `Permohonan baharu diterima [Sesi Temujanji: ${selectedSession}]`,
    });

    if (isRepeat) {
      await supabase.from('case_status_history').insert({
        case_id: newCase.id,
        old_status: null,
        new_status: 'Kes Berulang',
        notes: `Repeat customer - submission #${(existingCustomer?.submission_count || 1) + 1}`,
      });
    }

    // ─── Log activity ───
    await logActivity(supabase, {
      userId: null,
      actionType: 'form_submission',
      entityType: 'submission',
      entityId: submission.id,
      newValues: {
        customer_id: customerId,
        case_id: newCase.id,
        assigned_to: assignedPractitioner ? assignedPractitioner.id : null,
        appointment_session: selectedSession,
        is_repeat: isRepeat,
        source: source || 'Direct',
      },
      description: `Borang baharu daripada ${cleanName} (${formattedPhone}) - Temujanji: Sesi ${selectedSession}${assignedPractitioner ? ` [Auto-assigned to ${assignedPractitioner.full_name}]` : ''}`,
      ipAddress: ip,
    });

    // ─── Send Meta CAPI "Lead" event ───
    try {
      await sendCAPIEvent({
        eventName: 'Lead',
        eventId: event_id || submission.id,
        sourceUrl: landing_page_url || null,
        userData: {
          phone: formattedPhone,
          client_ip_address: ip,
          client_user_agent: user_agent,
        },
        clientIpAddress: ip,
        clientUserAgent: user_agent,
        fbp: fbp || null,
        fbc: fbc || null,
      });
    } catch (capiError) {
      console.error('CAPI Error (non-blocking):', capiError);
    }

    // ─── Send WasapBot Group Notification ───
    try {
      const message = buildLeadMessage({
        name:       cleanName,
        phone:      formattedPhone,
        session:    selectedSession,
        source:     source || 'Direct',
        problem:    problem || '',
        assignedTo: assignedPractitioner ? assignedPractitioner.full_name : null,
        isRepeat:   isRepeat,
      });
      await sendGroupNotification(message);
    } catch (waErr) {
      console.error('WasapBot Error (non-blocking):', waErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        customer_id: customerId,
        case_id: newCase.id,
        assigned_to: assignedPractitioner ? assignedPractitioner.id : null,
        assigned_practitioner_name: assignedPractitioner ? assignedPractitioner.full_name : null,
        is_repeat: isRepeat,
      },
    });

  } catch (error) {
    console.error('Submission API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Satu ralat telah berlaku. Sila cuba lagi.' },
      { status: 500 }
    );
  }
}

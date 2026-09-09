import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/utils/logger';
import { sendFpxCAPIEvent } from '@/lib/tracking/capi';
import { sendGroupNotification, buildOrderMessage } from '@/lib/notifications/wasapbot';

function verifySignature(rawBody, signatureHeader, publicKeyPem) {
  if (!signatureHeader || !publicKeyPem) return false;
  try {
    const formattedKey = publicKeyPem.replace(/\\n/g, '\n');
    const verifier = crypto.createVerify('SHA256');
    verifier.update(rawBody);
    const normalized = signatureHeader.replace(/^sha256=/i, '').trim();
    let sigBuffer;
    if (/^[0-9a-f]+$/i.test(normalized) && normalized.length % 2 === 0) {
      sigBuffer = Buffer.from(normalized, 'hex');
    } else {
      sigBuffer = Buffer.from(normalized, 'base64');
    }
    return verifier.verify(formattedKey, sigBuffer);
  } catch (err) {
    console.error('RSA Signature verify failed:', err.message);
    return false;
  }
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (_) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // ─── Verify RSA Signature ───
    const signatureHeader = req.headers.get('x-signature');
    const CHIP_PUBLIC_KEY = process.env.CHIP_PUBLIC_KEY;
    if (CHIP_PUBLIC_KEY && signatureHeader) {
      const isValid = verifySignature(rawBody, signatureHeader, CHIP_PUBLIC_KEY);
      if (!isValid) {
        console.warn('Invalid Chip webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // ─── Extract from TOP-LEVEL payload ───
    const billId = String(payload?.id || payload?.payment_id || '').trim();
    const chipStatus = String(payload?.status || '').toLowerCase().trim();
    if (!billId) return NextResponse.json({ error: 'Missing bill id' }, { status: 400 });

    const isPaid = ['paid', 'success', 'completed', 'executed'].includes(chipStatus);
    const isFailed = ['failed', 'cancelled', 'canceled', 'refunded', 'expired'].includes(chipStatus);

    const supabase = createAdminClient();

    // ─── Find Submission by chip_bill_id column (clean approach) ───
    let submission = null;
    try {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('chip_bill_id', billId)
        .maybeSingle();
      submission = data;
    } catch (_) {}

    // Fallback: search in notes (for old records before migration)
    if (!submission) {
      try {
        const { data } = await supabase
          .from('submissions')
          .select('*')
          .ilike('notes', `%[CHIP_BILL_ID:${billId}]%`)
          .limit(1);
        submission = data?.[0] || null;
      } catch (_) {}
    }

    if (!submission) {
      console.warn(`Submission not found for Chip Bill ID: ${billId}`);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // ─── Idempotency: skip DB updates if already processed, but still send WA ───
    const alreadyCompleted = submission.payment_status === 'completed';

    if (isPaid) {
      // Parse actual amount first — used in CAPI + WA + logs
      // Notes format: "[AMOUNT: MYR 95.00]" (FPX) or "[AMOUNT: RM95]" (COD)
      const amountMatch = (submission.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9.]+)\]/i);
      const amountValue = amountMatch ? parseFloat(amountMatch[1]) : 50.00;

      if (!alreadyCompleted) {
        // 1. Update submission payment_status → completed
        try {
          await supabase
            .from('submissions')
            .update({
              payment_status: 'completed',
              chip_bill_id: billId,
              notes: `${submission.notes || ''} [STATUS: paid] [CHIP_STATUS: ${chipStatus}] [PAID_AT: ${new Date().toISOString()}]`,
            })
            .eq('id', submission.id);
        } catch (e) {
          console.warn('Submission update skipped:', e.message);
        }

        // 2. Round-Robin Auto-assign Perawat
        let assignedPractitioner = null;
        try {
          const { data: allProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, role, is_active, is_receiving_cases, created_at')
            .order('created_at', { ascending: true });

          const activePractitioners = (allProfiles || []).filter(p =>
            p.role !== 'super_admin' && p.is_active !== false && p.is_receiving_cases !== false
          );

          if (activePractitioners.length > 0) {
            const { data: lastCase } = await supabase
              .from('cases')
              .select('assigned_to, created_at')
              .not('assigned_to', 'is', null)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (lastCase?.assigned_to) {
              const lastIdx = activePractitioners.findIndex(p => p.id === lastCase.assigned_to);
              const nextIdx = lastIdx !== -1 ? (lastIdx + 1) % activePractitioners.length : 0;
              assignedPractitioner = activePractitioners[nextIdx];
            } else {
              assignedPractitioner = activePractitioners[0];
            }
          }
        } catch (e) {
          console.warn('Round-robin skipped:', e.message);
        }

        // 3. Create Case for FPX paid patient
        let newCase = null;
        try {
          const caseStatus = assignedPractitioner ? 'Sedang Diurus' : 'Baru';
          const { data } = await supabase
            .from('cases')
            .insert({
              customer_id: submission.customer_id,
              submission_id: submission.id,
              status: caseStatus,
              assigned_to: assignedPractitioner ? assignedPractitioner.id : null,
            })
            .select()
            .single();
          newCase = data;

          if (newCase) {
            await supabase.from('case_status_history').insert({
              case_id: newCase.id,
              old_status: null,
              new_status: caseStatus,
              notes: `💳 Bayaran FPX RM${amountValue} BERJAYA via Chip. ${assignedPractitioner ? `Diagih kepada ${assignedPractitioner.full_name}` : 'Menunggu agihan perawat'}`,
            });
          }
        } catch (e) {
          console.warn('Case creation skipped (RLS/customer_id missing):', e.message);
        }

        // 4. Meta CAPI Purchase event
        try {
          await sendFpxCAPIEvent({
            eventName: 'Purchase',
            eventId: submission.event_id || submission.id,
            sourceUrl: submission.landing_page_url || null,
            userData: { phone: submission.phone, client_ip_address: submission.ip_address, client_user_agent: submission.user_agent },
            customData: { currency: 'MYR', value: amountValue, content_name: `ESyifaa FPX — RM${amountValue}` },
            clientIpAddress: submission.ip_address,
            clientUserAgent: submission.user_agent,
            fbp: submission.fbp || null,
            fbc: submission.fbc || null,
          });
        } catch (e) {
          console.error('CAPI FPX Purchase Error (non-blocking):', e.message);
        }

        // 6. Log activity
        try {
          await logActivity(supabase, {
            userId: null, actionType: 'chip_payment_success',
            entityType: 'submission', entityId: submission.id,
            newValues: { bill_id: billId, payment_status: 'completed', case_id: newCase?.id || null },
            description: `💳 Bayaran FPX RM${amountValue} disahkan — ${submission.full_name} (${submission.phone})`,
            ipAddress: submission.ip_address || 'webhook',
          });
        } catch (_) {}
      } // end !alreadyCompleted

      // 5. WasapBot Notification — hantar walaupun alreadyCompleted (idempotent safe)
      try {
        const msg = buildOrderMessage({
          name: submission.full_name,
          phone: submission.phone,
          product: submission.source?.includes('sabun') ? 'Sabun Garam Himalaya (FPX)' : 'Pengisian ESyifaa (FPX)',
          amount: `RM${amountValue} (FPX Online Banking)`,
          address: '—',
          source: submission.source || 'fsp-checkout',
          paymentType: 'fpx',
        });
        await sendGroupNotification(`💳 [BAYARAN FPX BERJAYA]\n${msg}`);
      } catch (e) {
        console.error('WasapBot Error (non-blocking):', e.message);
      }

    } else if (isFailed) {
      try {
        await supabase
          .from('submissions')
          .update({ payment_status: 'failed', notes: `${submission.notes || ''} [STATUS: failed] [CHIP_STATUS: ${chipStatus}]` })
          .eq('id', submission.id);
      } catch (_) {}
    }

    return NextResponse.json({ success: true, status: chipStatus });

  } catch (error) {
    console.error('Chip Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

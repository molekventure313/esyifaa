import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAttributedCAPIEvent } from '@/lib/tracking/attributed';
import { parseAmount } from '@/lib/marketer-calc';
import { completeFpxOrder, notifyFpxPaid } from '@/lib/payments';

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
      const amountValue = parseAmount(submission);

      if (!alreadyCompleted) {
        // Status completed, batal duplikat, tolak stok, log — lib/payments (sama dgn mark-paid manual).
        // Kes perawat TIDAK dicipta — kes hanya untuk SP rawatan (borang lead).
        try {
          await completeFpxOrder({ supabase, submission, via: 'chip', billId, chipStatus });
        } catch (e) {
          console.warn('Submission update skipped:', e.message);
        }

        // Meta CAPI Purchase — marketer order → pixel marketer SAHAJA (tiada fallback ke HQ);
        //    HQ order → HQ FPX pixel
        try {
          await sendAttributedCAPIEvent({ supabase, marketerId: submission.marketer_id, hqPixel: 'fpx', event: {
            eventName:  'Purchase',
            eventId:    `purchase_${submission.id}`,
            sourceUrl:  submission.landing_page_url || null,
            userData:   { phone: submission.phone, client_ip_address: submission.ip_address, client_user_agent: submission.user_agent },
            customData: { currency: 'MYR', value: amountValue, content_name: `ESyifaa FPX — RM${amountValue}` },
            clientIpAddress: submission.ip_address,
            clientUserAgent: submission.user_agent,
            fbp: submission.fbp || null,
            fbc: submission.fbc || null,
          } });
        } catch (e) {
          console.error('CAPI FPX Purchase Error (non-blocking):', e.message);
        }
      } // end !alreadyCompleted

      // WasapBot Notification — hantar walaupun alreadyCompleted (idempotent safe)
      await notifyFpxPaid(submission, amountValue, 'chip');

    } else if (isFailed) {
      // Order yang dah selesai (cth: marketer mark-paid bila pelanggan bayar melalui WhatsApp)
      // TAK BOLEH ditimpa jadi failed bila bil CHIP tamat tempoh kemudian.
      if (alreadyCompleted) {
        return NextResponse.json({ success: true, status: chipStatus, skipped: 'already_completed' });
      }
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

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submission_id');

    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submission_id' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: submission, error } = await supabase
      .from('submissions')
      .select('id, full_name, phone, notes, payment_status, marketer_id, amount_paid')
      .eq('id', submissionId)
      .single();

    if (error || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Determine payment status — guna kolum terus, fallback ke notes check
    const paid =
      submission.payment_status === 'completed' ||
      (submission.notes || '').includes('[STATUS: paid]') ||
      searchParams.get('mock') === 'true';
    const failed =
      submission.payment_status === 'failed' ||
      (submission.notes || '').includes('[STATUS: failed]');

    // Fetch marketer pixel ID if this is a marketer order
    let marketerPixelId = null;
    if (submission.marketer_id) {
      try {
        const { data: mProfile } = await supabase
          .from('profiles')
          .select('meta_pixel_id')
          .eq('id', submission.marketer_id)
          .maybeSingle();
        if (mProfile?.meta_pixel_id) {
          marketerPixelId = mProfile.meta_pixel_id;
        }
      } catch (_) {}
    }

    return NextResponse.json({
      success:          true,
      submission_id:    submission.id,
      full_name:        submission.full_name,
      phone:            submission.phone,
      payment_status:   paid ? 'completed' : failed ? 'failed' : 'pending',
      marketer_pixel_id: marketerPixelId, // null for HQ orders
      is_marketer_order: !!submission.marketer_id, // TQ: jangan fallback ke pixel HQ untuk order marketer
    });

  } catch (error) {
    console.error('Payment Status API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


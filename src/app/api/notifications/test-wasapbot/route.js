import { NextResponse } from 'next/server';
import { sendGroupNotification, buildLeadMessage } from '@/lib/notifications/wasapbot';
import { guard, OWNER } from '@/lib/auth';

/**
 * POST /api/notifications/test-wasapbot
 * Hantar test mesej ke WA group untuk verify integration berfungsi.
 * Hanya boleh diakses dari dashboard admin.
 */
export async function POST() {
  try {
    const g = await guard(OWNER);
    if (g.error) return g.error;
    const message = buildLeadMessage({
      name:       'Ahmad Test',
      phone:      '+60123456789',
      session:    'Pagi',
      source:     'TEST dari Dashboard',
      problem:    'Ini adalah mesej ujian dari ESyifa\' admin dashboard.',
      assignedTo: 'Ustaz Test',
      isRepeat:   false,
    });

    // Tambah header test
    const testMessage = `🧪 *[UJIAN — ABAIKAN]*\n\n${message}`;

    await sendGroupNotification(testMessage);

    return NextResponse.json({ success: true, message: 'Test notification berjaya dihantar ke group WA!' });
  } catch (err) {
    console.error('Test WasapBot error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal hantar test notification' },
      { status: 500 }
    );
  }
}

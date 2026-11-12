// Email pelanggan untuk bil CHIP (FPX). CHIP wajibkan email & kuncinya di halaman bayaran,
// jadi pelanggan isi (pilihan) dalam borang checkout kita. Kosong → email ganti <telefon>@esyifaa.com.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** { email } jika sah / kosong, atau { error } jika diisi tapi formatnya salah. */
export function chipClientEmail(raw, formattedPhone) {
  const email = String(raw || '').trim().toLowerCase();
  if (!email) return { email: `${formattedPhone}@esyifaa.com` };
  if (email.length > 100 || !EMAIL_RE.test(email)) return { error: 'Format email tidak sah. Betulkan atau biarkan kosong.' };
  return { email };
}

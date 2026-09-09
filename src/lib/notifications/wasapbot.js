/**
 * WasapBot Notification Utility
 * Hantar notifikasi WhatsApp ke group perawat setiap kali lead baru masuk.
 *
 * API: POST https://dash.wasapbot.my/api/send_group
 * Docs: Group API — field group_id format: "8498761xxxxxxxx@g.us"
 */

const WASAPBOT_API = 'https://dash.wasapbot.my/api/send_group';

/**
 * Hantar mesej ke WhatsApp group via WasapBot.
 * Fail silently — kegagalan WA tidak patut gagalkan submission utama.
 *
 * @param {string} message - Teks mesej (boleh guna \n untuk newline)
 * @returns {Promise<void>}
 */
export async function sendGroupNotification(message) {
  const instanceId = process.env.WASAPBOT_INSTANCE_ID;
  const accessToken = process.env.WASAPBOT_ACCESS_TOKEN;
  const groupId     = process.env.WASAPBOT_GROUP_ID; // format: 60xxx-xxxxxxxxx@g.us

  if (!instanceId || !accessToken || !groupId) {
    console.warn('[WasapBot] Credentials/Group ID tidak dijumpai dalam env — skip notification.');
    return;
  }

  try {
    const res = await fetch(WASAPBOT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id:     groupId,
        type:         'text',
        message:      message,
        instance_id:  instanceId,
        access_token: accessToken,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[WasapBot] Error ${res.status}:`, errText);
    } else {
      console.log('[WasapBot] ✅ Notifikasi berjaya dihantar ke group.');
    }
  } catch (err) {
    // Jangan throw — biar submission API tetap return success
    console.error('[WasapBot] Fetch error (non-blocking):', err.message);
  }
}

/**
 * Bina mesej notifikasi lead baru untuk group perawat.
 *
 * @param {Object} data
 * @param {string} data.name             - Nama pesakit
 * @param {string} data.phone            - Nombor telefon pesakit
 * @param {string} data.session          - Sesi temujanji (Pagi/Petang/Malam)
 * @param {string} data.source           - Sumber salespage
 * @param {string} [data.problem]        - Simptom/masalah
 * @param {string} [data.assignedTo]     - Nama perawat yang di-assign
 * @param {boolean} [data.isRepeat]      - Adakah pesakit berulang
 * @returns {string}
 */
export function buildLeadMessage({ name, phone, session, source, problem, assignedTo, isRepeat }) {
  const now = new Date().toLocaleString('ms-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const repeatTag = isRepeat ? '\n⚠️ *KES BERULANG*' : '';
  const assignTag = assignedTo ? `\n👨‍⚕️ Perawat: *${assignedTo}*` : '\n👨‍⚕️ Perawat: *Belum ditetapkan*';
  const problemLine = problem ? `\n📝 Simptom: ${problem.replace(/\[.*?\]/g, '').trim()}` : '';

  return (
    `🔔 *LEAD BARU — ESyifa'*${repeatTag}\n` +
    `─────────────────────\n` +
    `👤 Nama: *${name}*\n` +
    `📱 WA: *${phone}*\n` +
    `🏥 Sumber: *${source || 'Direct'}*\n` +
    `🕐 Sesi: *${session}*` +
    problemLine +
    assignTag + '\n' +
    `🕰️ ${now}\n` +
    `─────────────────────\n` +
    `Sila hubungi pesakit segera ✅`
  );
}

/**
 * Bina mesej notifikasi order baru (COD/FPX produk) untuk group admin.
 * Beza dari buildLeadMessage — ini untuk order produk (sabun, pengisian), bukan lead rawatan.
 *
 * @param {Object} data
 * @param {string} data.name          - Nama pelanggan
 * @param {string} data.phone         - Nombor telefon
 * @param {string} data.product       - Nama produk + pakej
 * @param {string} data.amount        - Jumlah bayaran (cth: "RM95 (COD)")
 * @param {string} [data.address]     - Alamat penghantaran (COD)
 * @param {string} [data.source]      - Sumber salespage
 * @param {string} [data.paymentType] - 'cod' | 'fpx'
 * @returns {string}
 */
export function buildOrderMessage({ name, phone, product, amount, address, source, paymentType }) {
  const now = new Date().toLocaleString('ms-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const icon = paymentType === 'cod' ? '📦' : '💳';
  const addressLine = address && address !== '—'
    ? `\n📍 Alamat: *${address}*`
    : '';

  return (
    `${icon} *ORDER BARU — ESyifa'*\n` +
    `─────────────────────\n` +
    `👤 Nama: *${name}*\n` +
    `📱 WA: *${phone}*\n` +
    `🛍️ Produk: *${product}*\n` +
    `💰 Jumlah: *${amount}*` +
    addressLine + '\n' +
    `🏪 Sumber: *${source || 'Direct'}*\n` +
    `🕰️ ${now}\n` +
    `─────────────────────\n` +
    (paymentType === 'cod'
      ? `Sila proses penghantaran ✅`
      : `Bayaran disahkan — sila proses ✅`)
  );
}

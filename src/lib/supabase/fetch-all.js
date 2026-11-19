// Supabase/PostgREST memulangkan MAKSIMUM 1000 baris setiap query (had projek) — query tanpa paginasi
// senyap-senyap terpotong (insiden 19/11: Laporan Marketer berhenti pada 1000 order walaupun bulan ini 1050).
// Guna fetchAllRows untuk sebarang query yang boleh melebihi 1000 baris.

const PAGE = 1000;

/**
 * Ambil SEMUA baris query, halaman demi halaman.
 * @param {() => any} build  fungsi yang bina query BARU setiap kali (query Supabase hanya boleh dijalankan sekali).
 *                           Susunan sedia ada dikekalkan; 'id' ditambah sebagai penentu supaya halaman stabil.
 * @returns {Promise<any[]>}
 */
export async function fetchAllRows(build) {
  const out = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build().order('id', { ascending: true }).range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < PAGE) return out;
  }
}

/** Sama seperti fetchAllRows tetapi pulang bentuk { data, error } (ganti terus `await query`) */
export async function selectAll(build) {
  try {
    return { data: await fetchAllRows(build), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Query `.in(col, ids)` dalam kumpulan — beratus id dalam satu URL = HTTP 400.
 * @param {(chunk: string[]) => any} build  bina query untuk satu kumpulan id
 */
export async function fetchByIds(ids, build, chunk = 150) {
  const out = [];
  for (let i = 0; i < ids.length; i += chunk) out.push(...await fetchAllRows(() => build(ids.slice(i, i + chunk))));
  return out;
}

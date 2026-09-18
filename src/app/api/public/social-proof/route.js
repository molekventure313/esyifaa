import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint — no auth needed
// Returns anonymized recent completed orders for social proof toast
export const revalidate = 300; // cache 5 minit

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("submissions")
      .select(`
        full_name,
        source,
        qty,
        notes,
        customers!left ( state )
      `)
      .eq("payment_status", "completed")
      .order("created_at", { ascending: false })
      .limit(40);

    if (error || !data) {
      return Response.json([], { status: 200 });
    }

    const SOURCE_MAP = {
      "sabun-garam":       "Sabun Garam Himalaya",
      "sabun-garam-1":     "Sabun Garam Himalaya",
      "sabun-garam-2":     "Sabun Garam Himalaya",
      "sabun-garam-3":     "Sabun Garam Himalaya",
      "sabun-garam-4":     "Sabun Garam Himalaya",
      "sabun-garam-5":     "Sabun Garam Himalaya",
      "fsp":               "Pakej Rawatan Ruqyah FSP",
      "pengisian-esyifa":  "Pengisian Air Tawar ESyifaa",
      "e-video":           "Video Panduan Ruqyah",
      "sihir":             "Pakej Rawatan Jarak Jauh",
      "saka":              "Pakej Rawatan Jarak Jauh",
      "belum-zuriat":      "Pakej Rawatan Jarak Jauh",
      "gangguan-berulang": "Pakej Rawatan Jarak Jauh",
      "kedai-tutup":       "Pakej Rawatan Jarak Jauh",
      "penyakit-misteri":  "Pakej Rawatan Jarak Jauh",
      "tasbih-esyifa":     "Tasbih Zikir ESyifaa",
    };

    const entries = data
      .filter(row => row.full_name?.trim())
      .map(row => {
        const firstName = row.full_name.trim().split(/\s+/)[0];

        let product = SOURCE_MAP[row.source] || null;
        if (!product && row.notes) {
          const match = row.notes.match(/\[PRODUK:\s*([^\]]+)\]/i);
          if (match) product = match[1].trim();
        }
        if (!product) product = "Produk ESyifaa";

        const qty = parseInt(row.qty) || 1;
        const state = row.customers?.state || null;

        return { name: firstName, state, product, qty };
      })
      .filter(e => e.name.length >= 2);

    return Response.json(entries, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("social-proof API error:", err);
    return Response.json([], { status: 200 });
  }
}

import { createAdminClient } from "@/lib/supabase/admin";
import { SP_GROUPS } from "@/lib/social-proof";

// Public endpoint — no auth needed
// GET /api/public/social-proof?product=<kumpulan>  (sabun | kasturi | garam | pengisian | ruqyah-harian | rawatan)
// Pulangkan order SEBENAR yang dah dibayar (14 hari terakhir) untuk produk itu sahaja — nama pertama,
// negeri, kuantiti & masa order sebenar. Tiada data rekaan.
export const dynamic = "force-dynamic";

const CACHE = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" };

export async function GET(req) {
  try {
    const key = new URL(req.url).searchParams.get("product");
    const group = SP_GROUPS[key];
    if (!group) return Response.json([], { status: 200, headers: CACHE });

    const since = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
    const { data, error } = await createAdminClient()
      .from("submissions")
      .select("full_name, source, qty, created_at, returned_at, customers!left ( state )")
      .eq("payment_status", "completed")
      .is("returned_at", null)
      .gte("created_at", since)
      .or(group.sources.map(s => `source.like.${s}%`).join(","))
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !data) return Response.json([], { status: 200 });

    const entries = data
      .filter(row => row.full_name?.trim())
      .map(row => ({
        name: row.full_name.trim().split(/\s+/)[0],
        state: row.customers?.state || null,
        qty: parseInt(row.qty) || 1,
        at: row.created_at,
      }))
      .filter(e => e.name.length >= 2);

    return Response.json(entries, { status: 200, headers: CACHE });
  } catch (err) {
    console.error("social-proof API error:", err);
    return Response.json([], { status: 200 });
  }
}

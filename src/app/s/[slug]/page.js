import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { SP_PRODUCTS } from '@/lib/sp-generator/products';
import GeneratedPage from '@/components/salespage/generated/GeneratedPage';

// SP yang dijana marketer — /s/<slug>
// Atribusi: SP milik marketer SENTIASA dibuka dengan ?m=<kod pemilik> (redirect) — jadi no. WhatsApp,
// pixel & order masuk ke marketer itu melalui aliran ?m= sedia ada. SP milik HQ (super_admin) = tanpa ?m=.
// ?preview=1 → pemilik / super_admin nampak DRAF (belum publish).

export const dynamic = 'force-dynamic';

async function load(slug) {
  if (!/^[a-z0-9-]{3,50}$/.test(slug || '')) return null;
  const admin = createAdminClient();
  const { data: sp } = await admin.from('ai_salespages')
    .select('id, owner_id, product_key, title, status, content, published_content')
    .eq('slug', slug).maybeSingle();
  if (!sp || !SP_PRODUCTS[sp.product_key]) return null;
  const { data: owner } = await admin.from('profiles')
    .select('id, role, marketer_code, is_active').eq('id', sp.owner_id).maybeSingle();
  return { sp, owner };
}

async function canPreview(sp) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    if (user.id === sp.owner_id) return true;
    const { data: me } = await createAdminClient().from('profiles').select('role').eq('id', user.id).maybeSingle();
    return me?.role === 'super_admin';
  } catch { return false; }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const r = await load(slug);
  const c = r?.sp?.published_content || r?.sp?.content;
  const p = r ? SP_PRODUCTS[r.sp.product_key] : null;
  return {
    title: c?.meta?.title || p?.label || "E-Syifa'",
    description: c?.meta?.description || undefined,
    robots: { index: false, follow: false },
  };
}

export default async function GeneratedSalesPage({ params, searchParams }) {
  const { slug } = await params;
  const sp_ = await searchParams;
  const r = await load(slug);
  if (!r) notFound();
  const { sp, owner } = r;

  const preview = sp_?.preview === '1' && await canPreview(sp);
  const content = preview ? sp.content : (sp.status === 'published' ? sp.published_content : null);
  if (!content) notFound();

  // Paksa ?m=<kod pemilik> (kekalkan utm/fbclid). Marketer tidak aktif → SP jadi milik HQ (tanpa ?m=).
  const code = owner?.role === 'marketer' && owner.is_active !== false ? owner.marketer_code : null;
  const current = typeof sp_?.m === 'string' ? sp_.m : '';
  if ((code || '').toLowerCase() !== current.toLowerCase()) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(sp_ || {})) {
      if (k === 'm') continue;
      for (const val of [].concat(v)) qs.append(k, val);
    }
    if (code) qs.set('m', code);
    const q = qs.toString();
    redirect(`/s/${slug}${q ? `?${q}` : ''}`);
  }

  return (
    <>
      {preview && (
        <div style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#F59E0B', color: '#111827', textAlign: 'center', padding: '0.5rem 1rem', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-inter), sans-serif' }}>
          👁 PREVIEW DRAF — hanya anda nampak versi ini{sp.status !== 'published' ? ' · SP belum dipublish' : ''}
        </div>
      )}
      <GeneratedPage productKey={sp.product_key} content={content} />
    </>
  );
}

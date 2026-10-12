import { NextResponse } from 'next/server';
import { spGuard } from '@/lib/sp-generator/server';

// SP Generator — upload gambar SP (bucket AWAM 'sp-images'), pulangkan URL awam.
// POST multipart { file } — gambar dimampatkan di browser dulu (~300KB)

const BUCKET = 'sp-images';
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req) {
  const g = await spGuard();
  if (g.error) return g.error;
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return NextResponse.json({ success: false, error: 'Tiada gambar.' }, { status: 400 });
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return NextResponse.json({ success: false, error: 'Fail mesti gambar (JPG/PNG/WEBP).' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ success: false, error: 'Gambar terlalu besar (maks 5MB).' }, { status: 400 });

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${g.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await g.admin.storage.from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false, cacheControl: '31536000' });
    if (error) throw new Error(`Gagal upload gambar: ${error.message} (dah run migration 022?)`);

    const { data } = g.admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ success: true, url: data.publicUrl });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

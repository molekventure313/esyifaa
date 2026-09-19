/**
 * /m/[slug] — Dedicated Marketer SP Route
 * Server Component — boleh import kedua-dua server & client page components.
 *
 * HQ pixel: ClientPixelProvider (root layout) auto-skip untuk /m/ routes.
 * Marketer pixel: MarketerPixelProvider dalam setiap page component.
 *
 * URL format: e-syifa.com/m/sihir?m=MARKETER_CODE
 */

import { notFound } from 'next/navigation';

// Static imports — server component boleh import server & client components
import SihirPage from '@/app/sihir/page';
import SakaPage from '@/app/saka/page';
import BelumZuriatPage from '@/app/belum-zuriat/page';
import GangguanBerulangPage from '@/app/gangguan-berulang/page';
import KedaiTutupPage from '@/app/kedai-tutup/page';
import PenyakitMisteriPage from '@/app/penyakit-misteri/page';
import FspPage from '@/app/fsp/page';
import EVideoPage from '@/app/e-video/page';
import PengisianEsyifaPage from '@/app/pengisian-esyifa/page';
import RawatSendiriPage from '@/app/rawat-sendiri/page';
import TasbihEsyifaPage from '@/app/tasbih-esyifa/page';
import SabunGaramPage from '@/app/sabun-garam/page';
import SabunGaram1Page from '@/app/sabun-garam-1/page';
import SabunGaram2Page from '@/app/sabun-garam-2/page';
import SabunGaram3Page from '@/app/sabun-garam-3/page';
import SabunGaram4Page from '@/app/sabun-garam-4/page';
import SabunGaram5Page from '@/app/sabun-garam-5/page';
import GaramPengasihanPage from '@/app/garam-pengasihan/page';
import KasturiKijangPage from '@/app/kasturi-kijang/page';

const PAGE_MAP = {
  'sihir':             SihirPage,
  'saka':              SakaPage,
  'belum-zuriat':      BelumZuriatPage,
  'gangguan-berulang': GangguanBerulangPage,
  'kedai-tutup':       KedaiTutupPage,
  'penyakit-misteri':  PenyakitMisteriPage,
  'fsp':               FspPage,
  'e-video':           EVideoPage,
  'pengisian-esyifa':  PengisianEsyifaPage,
  'rawat-sendiri':     RawatSendiriPage,
  'tasbih-esyifa':     TasbihEsyifaPage,
  'sabun-garam':       SabunGaramPage,
  'sabun-garam-1':     SabunGaram1Page,
  'sabun-garam-2':     SabunGaram2Page,
  'sabun-garam-3':     SabunGaram3Page,
  'sabun-garam-4':     SabunGaram4Page,
  'sabun-garam-5':     SabunGaram5Page,
  'garam-pengasihan':  GaramPengasihanPage,
  'kasturi-kijang':    KasturiKijangPage,
};

// Next.js 15: params is a Promise
export default async function MarketerSPPage({ params }) {
  const { slug } = await params;
  const PageContent = PAGE_MAP[slug];
  if (!PageContent) return notFound();
  return <PageContent />;
}
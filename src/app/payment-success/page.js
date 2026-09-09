'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submission_id') || searchParams.get('order_id');
  const isMock       = searchParams.get('mock') === 'true';
  const type         = searchParams.get('type');         // 'cod' | null (FPX)
  const amountParam  = searchParams.get('amount');       // e.g. '95', '44'
  const productParam = searchParams.get('product');      // e.g. 'Sabun Garam 3 Unit'

  const isCod = type === 'cod';

  const [status, setStatus] = useState(isMock || isCod ? 'completed' : 'pending');
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(!isMock && !isCod);
  const [fpxPixelId, setFpxPixelId] = useState(null);

  // Amount & product — read from URL params first (most accurate)
  const [amount, setAmount]           = useState(parseFloat(amountParam) || 50.00);
  const [productName, setProductName] = useState(
    productParam ? decodeURIComponent(productParam) : (isCod ? 'Sabun Garam Himalaya' : 'ESyifaa Payment')
  );

  // Inject FPX pixel script + fetch pixel ID for client-side Purchase backup
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/api/pixel-fpx-init';
    script.async = true;
    document.head.appendChild(script);

    fetch('/api/tracking/fpx-pixel-id')
      .then(r => r.json())
      .then(json => { if (json.fpx_pixel_id) setFpxPixelId(json.fpx_pixel_id); })
      .catch(() => {});

    return () => { try { document.head.removeChild(script); } catch (_) {} };
  }, []);

  // Poll payment status from Chip (FPX only — COD skips this)
  useEffect(() => {
    if (isMock) {
      setData({ submission_id: submissionId || 'MOCK-12345', full_name: 'Pelanggan Ujian', phone: '0123456789', payment_status: 'completed' });
      setLoading(false);
      return;
    }

    // COD — no polling needed, status already set to completed
    if (isCod) {
      setLoading(false);
      return;
    }

    if (!submissionId) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    let pollCount = 0;
    const maxPolls = 8;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/chip/status?submission_id=${submissionId}`);
        const json = await res.json();

        if (isSubscribed && json.success) {
          setData(json);
          setStatus(json.payment_status);

          // Update amount from API if not already set from URL
          if (json.amount_paid && !amountParam) {
            setAmount(parseFloat(json.amount_paid));
          }
          if (json.product_name && !productParam) {
            setProductName(json.product_name);
          }

          if (json.payment_status === 'completed') {
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }

      pollCount++;
      if (pollCount < maxPolls && isSubscribed) {
        setTimeout(checkStatus, 2000);
      } else if (isSubscribed) {
        setLoading(false);
      }
    };

    checkStatus();
    return () => { isSubscribed = false; };
  }, [submissionId, isMock, isCod, amountParam, productParam]);

  // Fire Purchase pixel when status = completed (covers FPX + COD)
  useEffect(() => {
    if (status !== 'completed' || !fpxPixelId) return;
    try {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackSingle', fpxPixelId, 'Purchase', {
          value: amount,
          currency: 'MYR',
          content_name: productName,
        }, { eventID: `ps_${submissionId || Date.now()}` });
      }
    } catch (_) {}
  }, [status, fpxPixelId, amount, productName, submissionId]);

  // ─── Display content — same message for both COD and FPX ───
  const displayTitle    = `Pesanan Diterima — RM${amount.toFixed(2)}`;
  const displaySubtitle = `Pesanan anda telah diterima! Barang akan dihantar dalam masa 1–5 hari bekerja. Jika bayar COD, sila sediakan wang tunai yang mencukupi apabila kurier tiba.`;
  const amountLabel     = isCod
    ? `RM${amount.toFixed(2)} (Bayar Masa Terima — COD)`
    : `RM${amount.toFixed(2)} (FPX Online Banking)`;
  const statusLabel = isCod ? 'ORDER DITERIMA' : 'TRANSAKSI BERJAYA';
  const ctaNote = `💡 Penghantaran 1–5 hari bekerja${isCod ? `. Sediakan RM${amount.toFixed(2)} tunai semasa kurier tiba` : ''}.`;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>

      {loading ? (
        <div style={{ background: '#090A0F', border: '1px solid rgba(253,224,71,0.3)', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem' }}>
            Mengesahkan Pembayaran FPX Anda...
          </h2>
          <p style={{ color: '#D1FAE5', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Sila tunggu sebentar. Sistem sedang mengesahkan transaksi daripada bank anda.
          </p>
        </div>
      ) : status === 'completed' ? (
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
          border: '3px solid #22C55E',
          borderRadius: '24px',
          padding: '3rem 2rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#22C55E', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.8rem', margin: '0 auto 1.5rem auto',
            boxShadow: '0 10px 25px rgba(34,197,94,0.4)'
          }}>
            ✓
          </div>

          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {statusLabel}
          </span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: 900, color: '#FDE047', marginTop: '0.4rem', marginBottom: '0.8rem', lineHeight: 1.25 }}>
            {displayTitle}
          </h1>

          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, marginBottom: '2rem' }}>
            {displaySubtitle}
          </p>

          {/* Details Card */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(253,224,71,0.25)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            color: '#FEF3C7'
          }}>
            {data?.full_name && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
                <span>{isOrder ? 'Nama Penerima:' : 'Nama Pesakit:'}</span>
                <strong style={{ color: '#FFFFFF' }}>{data.full_name}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
              <span>Produk:</span>
              <strong style={{ color: '#FFFFFF' }}>{productName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: ctaNote ? '0.5rem' : 0, borderBottom: ctaNote ? '1px dashed rgba(255,255,255,0.1)' : 'none', marginBottom: ctaNote ? '0.5rem' : 0 }}>
              <span>Jumlah Bayaran:</span>
              <strong style={{ color: '#4ADE80' }}>{amountLabel}</strong>
            </div>
            {ctaNote && (
              <div style={{ paddingTop: '0.25rem', fontSize: '0.85rem', color: '#FDE047', fontStyle: 'italic' }}>
                {ctaNote}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '1rem 2.2rem',
                fontSize: '1rem',
                fontWeight: 800,
                color: '#042E23',
                background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
                borderRadius: '50px',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(234,179,8,0.4)',
                border: '2px solid #FEF08A'
              }}
            >
              🏠 Kembali Ke Halaman Utama
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ background: '#181010', border: '2px solid #F87171', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FCA5A5', marginBottom: '0.5rem' }}>
            Pembayaran Belum Disahkan
          </h2>
          <p style={{ color: '#FEF3C7', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Sistem belum menerima sah status bayaran FPX anda. Sekiranya anda telah membuat bayaran, sila simpan resit dan hubungi kami.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.85rem 1.8rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              color: '#FFFFFF',
              background: '#DC2626',
              borderRadius: '50px',
              textDecoration: 'none'
            }}
          >
            🔄 Cuba Lagi
          </Link>
        </div>
      )}

    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#042E23',
      color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Suspense fallback={
        <div style={{ textAlign: 'center', color: '#FDE047' }}>
          Memuatkan pengesahan pembayaran...
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </main>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

export default function PengisianCheckoutForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    problem: '',
    honeypot: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pixel setup
  const fpxPixelId = '349586411516766';
  const amount_in_myr = 90.00;

  useEffect(() => {
    // Inject fbq initialization
    const script = document.createElement('script');
    script.src = '/api/pixel-fpx-init';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCookie = (name) => {
    if (typeof document === 'undefined') return '';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Honeypot check
    if (formData.honeypot) {
      console.log('Spam detected');
      return;
    }

    if (!formData.full_name || !formData.phone || !formData.problem) {
      setErrorMessage('Sila isikan semua maklumat yang diperlukan.');
      return;
    }

    setIsLoading(true);

    try {
      // Fire InitiateCheckout pixel
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackSingle', fpxPixelId, 'InitiateCheckout', { 
          value: amount_in_myr, 
          currency: 'MYR' 
        });
      }

      const fbp = getCookie('_fbp') || '';
      const fbc = getCookie('_fbc') || '';

      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get('utm_source') || '';
      const utm_medium = urlParams.get('utm_medium') || '';
      const utm_campaign = urlParams.get('utm_campaign') || '';

      // Create event_id
      const event_id = 'evt_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

      const requestBody = {
        full_name: formData.full_name,
        phone: formData.phone.startsWith('+') ? formData.phone : `+60${formData.phone.replace(/^0/, '')}`,
        problem: formData.problem,
        source: 'tasbih-esyifa',
        amount_in_myr: amount_in_myr,
        event_id,
        fbp,
        fbc,
        utm_source,
        utm_medium,
        utm_campaign,
        client_user_agent: navigator.userAgent,
        client_ip_address: '' // Will be resolved at server
      };

      const res = await fetch('/api/payments/chip/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi ralat semasa memproses pembayaran');
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('URL pembayaran tidak ditemui');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage(error.message || 'Terjadi ralat, sila cuba lagi');
      setIsLoading(false);
    }
  };

  return (
    <section id="borang" className="bg-[#031E17] py-16 px-4 font-inter relative z-10 border-t border-[#042E23]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block bg-[#042E23] border border-[#FDE047]/30 text-[#FDE047] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
            LANGKAH PERTAMA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FEF3C7] mb-4 leading-tight">
            Tempah Pengisian & Bayar RM90 Melalui FPX
          </h2>
          <p className="text-[#D1FAE5] text-lg max-w-xl mx-auto">
            Isi borang ringkas di bawah. Nyatakan barang yang ingin diisikan. Perawat akan hubungi anda dalam 24 jam untuk pengesahan.
          </p>
        </div>

        <div className="bg-[#10131A] p-6 md:p-8 rounded-2xl border border-[#34D399]/30 shadow-2xl relative">
          
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-[#031E17] p-3 rounded-lg border border-[#042E23] flex items-center gap-2 text-[#A7F3D0] text-sm">
              <span>💎</span> Pengisian 7 Hari
            </div>
            <div className="bg-[#031E17] p-3 rounded-lg border border-[#042E23] flex items-center gap-2 text-[#A7F3D0] text-sm">
              <span>🔄</span> Pelarasan Mingguan
            </div>
            <div className="bg-[#031E17] p-3 rounded-lg border border-[#042E23] flex items-center gap-2 text-[#A7F3D0] text-sm">
              <span>🔒</span> Bayaran Selamat
            </div>
            <div className="bg-[#031E17] p-3 rounded-lg border border-[#042E23] flex items-center gap-2 text-[#A7F3D0] text-sm">
              <span>⚡</span> Respon Dalam 24 Jam
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field - hidden from users */}
            <input 
              type="text" 
              name="honeypot" 
              value={formData.honeypot} 
              onChange={handleChange} 
              style={{ display: 'none' }} 
              tabIndex="-1" 
              autoComplete="off" 
            />

            <div>
              <label className="block text-[#D1FAE5] font-semibold mb-2">Nama Penuh</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full bg-[#031E17] border border-[#042E23] rounded-xl px-4 py-3 text-[#FEF3C7] focus:outline-none focus:border-[#34D399] transition-colors"
                placeholder="Ali Bin Abu"
              />
            </div>

            <div>
              <label className="block text-[#D1FAE5] font-semibold mb-2">No. Telefon (WhatsApp)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-[#031E17] border border-[#042E23] rounded-xl px-4 py-3 text-[#FEF3C7] focus:outline-none focus:border-[#34D399] transition-colors"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-[#D1FAE5] font-semibold mb-2">Nama & Jenis Barang Yang Ingin Diisikan</label>
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-[#031E17] border border-[#042E23] rounded-xl px-4 py-3 text-[#FEF3C7] focus:outline-none focus:border-[#34D399] transition-colors resize-none"
                placeholder="Contoh: Cincin emas di tangan kiri, tasbih kayu, jam tangan hitam..."
              />
            </div>

            {errorMessage && (
              <div className="bg-[#EF4444]/20 border border-[#EF4444] text-[#FCA5A5] p-4 rounded-xl text-sm">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all flex justify-center items-center gap-2 ${
                isLoading 
                  ? 'bg-[#042E23] text-[#A7F3D0] cursor-not-allowed' 
                  : 'bg-[#34D399] hover:bg-[#10B981] text-[#031E17] hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#A7F3D0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses Tempahan...
                </>
              ) : (
                '💎 Tempah & Bayar RM90 via FPX'
              )}
            </button>
            <div className="text-center mt-4 text-[#A7F3D0] text-xs opacity-80 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Pembayaran dijamin selamat dan diproses oleh CHIP
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

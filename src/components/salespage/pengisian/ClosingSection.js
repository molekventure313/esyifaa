'use client';
import React from 'react';

export default function ClosingSection() {
  const scrollToForm = () => {
    const formEl = document.getElementById('borang');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#031E17] to-[#02100C] py-20 px-4 font-inter relative z-10 border-t border-[#042E23]">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block bg-[#042E23] border border-[#FDE047]/30 text-[#FDE047] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
          💎 JANGAN TANGGUH LAGI
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-[#FEF3C7] mb-6 leading-tight">
          Barang Anda Tunggu Untuk Diisikan
        </h2>
        <p className="text-[#D1FAE5] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Setiap hari tanpa perlindungan adalah hari anda dan keluarga terdedah. Mulakan pengisian hari ini — siap dalam 7 hari, pelarasan setiap minggu, selamanya.
        </p>

        <button 
          onClick={scrollToForm}
          className="w-full md:w-auto px-8 py-4 bg-[#FDE047] hover:bg-[#FACC15] text-[#031E17] font-bold rounded-xl text-lg md:text-xl shadow-[0_0_20px_rgba(253,224,71,0.4)] transition-all transform hover:scale-105 active:scale-95"
        >
          💎 Tempah Pengisian RM90 Sekarang
        </button>
        <p className="mt-4 text-[#A7F3D0] text-sm">
          Bayar via FPX · Selamat · Patuh Syariah
        </p>
      </div>
    </section>
  );
}

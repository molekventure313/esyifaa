'use client';
import React from 'react';

export default function PaymentSection() {
  return (
    <section className="bg-[#031E17] py-16 px-4 font-inter relative z-10 border-t border-[#042E23]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#042E23] border border-[#FDE047]/30 text-[#FDE047] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
            💎 PAKEJ PENGISIAN
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FEF3C7] mb-6 leading-tight">
            Satu Pakej. Empat Lapisan Perlindungan. RM90 Sahaja.
          </h2>
          <p className="text-[#D1FAE5] text-lg max-w-3xl mx-auto leading-relaxed">
            Bayar sekali, nikmati perlindungan seumur hidup dengan pelarasan mingguan automatik dari perawat ESyifaa.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-[#042E23] rounded-3xl border-2 border-[#FDE047]/40 overflow-hidden relative shadow-[0_0_30px_rgba(253,224,71,0.1)]">
            <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-[#FDE047] to-[#F59E0B] text-[#031E17] font-bold text-center py-2 text-sm">
              ✨ Termasuk Pelarasan Mingguan Selamanya
            </div>
            
            <div className="p-8 pt-12 md:p-12 md:pt-16 text-center border-b border-[#047857]/50">
              <h3 className="text-2xl font-bold text-[#FEF3C7] mb-4">Pakej Pengisian Ayat Ruqyah</h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-[#A7F3D0] line-through text-xl">RM250</span>
                <span className="text-5xl font-bold text-[#FDE047]">RM90</span>
              </div>
              <p className="text-[#4ADE80] text-sm">Sekali bayar · Pelarasan mingguan percuma selamanya</p>
            </div>

            <div className="p-8 md:p-10 bg-[#031E17]">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🔥</span>
                  <span className="text-[#D1FAE5]">Pengisian Ayat Ruqyah Pembakar & Pemusnah Jin</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✂️</span>
                  <span className="text-[#D1FAE5]">Pengisian Ayat Pembatal Sihir</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🛡️</span>
                  <span className="text-[#D1FAE5]">Pengisian Ayat Benteng Sihir & Gangguan Jin</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">💚</span>
                  <span className="text-[#D1FAE5]">Pengisian Ayat-ayat Kesembuhan</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🔄</span>
                  <span className="text-[#D1FAE5] font-semibold text-[#FDE047]">Pelarasan & Pengisian Semula Setiap Minggu (PERCUMA Selamanya)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📋</span>
                  <span className="text-[#D1FAE5]">Monitoring Hasil Pengisian (7 hari pertama)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📞</span>
                  <span className="text-[#D1FAE5]">Konsultasi Ringkas Via WhatsApp Sebelum Pengisian</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center bg-[#042E23] p-6 rounded-xl border border-[#4ADE80]/20">
            <p className="text-[#A7F3D0] italic">
              "Nilai sebenar perkhidmatan ini adalah RM250 — namun ESyifaa menawarkan pada RM90 sahaja kerana kami percaya perlindungan ruqyah patut mudah diakses oleh semua pesakit."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

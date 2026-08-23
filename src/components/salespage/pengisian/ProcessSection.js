'use client';
import React from 'react';

export default function ProcessSection() {
  return (
    <section className="bg-[#042E23] py-16 px-4 font-inter relative z-10 border-t border-[#031E17]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#031E17] border border-[#FDE047]/30 text-[#FDE047] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
            🗓️ PROSES TEMPAHAN
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FEF3C7] mb-6 leading-tight">
            4 Langkah Mudah — Dari Tempahan Hingga Mula Guna
          </h2>
          <p className="text-[#D1FAE5] text-lg max-w-3xl mx-auto leading-relaxed">
            Proses yang mudah dan telus. Dari tempahan hingga barang anda siap diisikan — semua dalam 7 hari.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line connector */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-[#4ADE80]/30 z-0"></div>
          
          <div className="space-y-12 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-0">
              <div className="md:w-5/12 order-2 md:order-1">
                <div className="bg-[#031E17] p-6 rounded-2xl border border-[#4ADE80]/20 text-center md:text-right hover:border-[#FDE047]/40 transition-colors">
                  <div className="text-[#4ADE80] font-bold text-sm mb-2 uppercase tracking-wider">Langkah 01</div>
                  <h3 className="text-[#FDE047] text-xl font-bold mb-3">Isi Borang & Bayar RM90 via FPX</h3>
                  <p className="text-[#A7F3D0] text-sm leading-relaxed">
                    Isi borang ringkas di bawah. Nyatakan nama dan jenis barang anda. Bayar RM90 terus melalui FPX Online Banking — selamat dan segera.
                  </p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-[#047857] border-4 border-[#031E17] flex items-center justify-center text-2xl order-1 md:order-2 shadow-[0_0_15px_rgba(74,222,128,0.3)] z-10">
                💳
              </div>
              <div className="md:w-5/12 order-3"></div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-0">
              <div className="md:w-5/12 order-3 md:order-1"></div>
              <div className="w-16 h-16 rounded-full bg-[#047857] border-4 border-[#031E17] flex items-center justify-center text-2xl order-1 md:order-2 shadow-[0_0_15px_rgba(74,222,128,0.3)] z-10">
                📞
              </div>
              <div className="md:w-5/12 order-2 md:order-3">
                <div className="bg-[#031E17] p-6 rounded-2xl border border-[#4ADE80]/20 text-center md:text-left hover:border-[#FDE047]/40 transition-colors">
                  <div className="text-[#4ADE80] font-bold text-sm mb-2 uppercase tracking-wider">Langkah 02</div>
                  <h3 className="text-[#FDE047] text-xl font-bold mb-3">Perawat Hubungi Via WhatsApp</h3>
                  <p className="text-[#A7F3D0] text-sm leading-relaxed">
                    Dalam masa 24 jam, perawat ESyifaa akan menghubungi anda melalui WhatsApp untuk mengesahkan maklumat barang dan memberi panduan awal.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-0">
              <div className="md:w-5/12 order-2 md:order-1">
                <div className="bg-[#031E17] p-6 rounded-2xl border border-[#4ADE80]/20 text-center md:text-right hover:border-[#FDE047]/40 transition-colors">
                  <div className="text-[#4ADE80] font-bold text-sm mb-2 uppercase tracking-wider">Langkah 03</div>
                  <h3 className="text-[#FDE047] text-xl font-bold mb-3">Proses Pengisian Ayat Ruqyah Dijalankan</h3>
                  <p className="text-[#A7F3D0] text-sm leading-relaxed">
                    Perawat menjalankan pengisian ayat ruqyah secara jarak jauh selama 7 hari berturut-turut. Anda tidak perlu buat apa-apa — cukup simpan barang bersama anda.
                  </p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-[#047857] border-4 border-[#031E17] flex items-center justify-center text-2xl order-1 md:order-2 shadow-[0_0_15px_rgba(74,222,128,0.3)] z-10">
                ⭐
              </div>
              <div className="md:w-5/12 order-3"></div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-0">
              <div className="md:w-5/12 order-3 md:order-1"></div>
              <div className="w-16 h-16 rounded-full bg-[#047857] border-4 border-[#031E17] flex items-center justify-center text-2xl order-1 md:order-2 shadow-[0_0_15px_rgba(74,222,128,0.3)] z-10">
                🎉
              </div>
              <div className="md:w-5/12 order-2 md:order-3">
                <div className="bg-[#031E17] p-6 rounded-2xl border border-[#4ADE80]/20 text-center md:text-left hover:border-[#FDE047]/40 transition-colors">
                  <div className="text-[#4ADE80] font-bold text-sm mb-2 uppercase tracking-wider">Langkah 04</div>
                  <h3 className="text-[#FDE047] text-xl font-bold mb-3">Selepas 7 Hari — Terus Guna</h3>
                  <p className="text-[#A7F3D0] text-sm leading-relaxed">
                    Selepas 7 hari, barang anda sudah siap diisikan. Boleh terus gunakan untuk rawat diri, ahli keluarga dan sebagai perlindungan harian yang berterusan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

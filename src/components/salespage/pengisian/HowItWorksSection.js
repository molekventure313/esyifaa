'use client';
import React from 'react';

export default function HowItWorksSection() {
  return (
    <section className="bg-[#031E17] py-16 px-4 font-inter relative z-10 border-t border-[#042E23]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#042E23] border border-[#FDE047]/30 text-[#FDE047] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
            📖 APA YANG DIISIKAN
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FEF3C7] mb-6 leading-tight">
            4 Lapisan Ayat Ruqyah — Perlindungan Menyeluruh
          </h2>
          <p className="text-[#D1FAE5] text-lg max-w-3xl mx-auto leading-relaxed">
            Setiap barang diisi dengan 4 lapisan ayat ruqyah syar'iyyah yang berbeza fungsi. Bukan sekadar bacaan biasa — ini gabungan yang direka untuk merawat, membakar, membatal dan membentengi secara serentak.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#042E23] p-8 rounded-2xl border border-[#EF4444]/30 hover:border-[#EF4444]/60 transition-colors">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Ayat Ruqyah Pembakar & Pemusnah Jin</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Ayat-ayat yang membakar dan memusnahkan jin yang menetap atau menyerang. Bertindak balas secara aktif apabila ada gangguan jin yang cuba mendekat.
            </p>
          </div>
          
          <div className="bg-[#042E23] p-8 rounded-2xl border border-[#F59E0B]/30 hover:border-[#F59E0B]/60 transition-colors">
            <div className="text-4xl mb-4">✂️</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Ayat Pembatal Sihir</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Memutuskan dan membatalkan ikatan sihir yang pernah dihantar atau sedang aktif. Ayat ini melemahkan setiap serangan sihir dari punca asalnya.
            </p>
          </div>

          <div className="bg-[#042E23] p-8 rounded-2xl border border-[#4ADE80]/30 hover:border-[#4ADE80]/60 transition-colors">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Ayat Benteng Sihir & Gangguan Jin</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Membina dinding perlindungan di sekeliling barang dan pemiliknya. Jin dan sihir yang cuba mendekat akan dihalang dan dipukul balik.
            </p>
          </div>

          <div className="bg-[#042E23] p-8 rounded-2xl border border-[#34D399]/30 hover:border-[#34D399]/60 transition-colors">
            <div className="text-4xl mb-4">💚</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Ayat-Ayat Kesembuhan</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Memulihkan kesan-kesan gangguan yang masih tinggal dalam badan. Membantu proses penyembuhan spiritual dan fizikal secara berterusan.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#065F46] to-[#047857] p-8 rounded-2xl border border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <div className="flex items-start gap-4">
            <div className="text-4xl mt-1">🔄</div>
            <div>
              <h3 className="text-[#FEF3C7] text-xl font-bold mb-2">
                Kekuatan Tidak Berkurang — Pelarasan Setiap Minggu
              </h3>
              <p className="text-[#D1FAE5] leading-relaxed">
                Berbeza dengan air penawar atau barang bacaan biasa yang kekuatannya berkurang dengan masa, perawat ESyifaa akan buat pelarasan dan pengisian semula setiap minggu secara automatik. Barang anda sentiasa pada kapasiti penuh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

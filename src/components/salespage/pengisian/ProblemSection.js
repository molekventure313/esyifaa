'use client';
import React from 'react';

export default function ProblemSection() {
  return (
    <section className="bg-[#031E17] py-16 px-4 font-inter relative z-10 border-t border-[#042E23]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#042E23] border border-[#FDE047]/30 text-[#FDE047] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
            ⚠️ KENAPA PERLU PENGISIAN?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FEF3C7] mb-6 leading-tight">
            Bila Tiada Barang Berisian — Anda Tidak Bersedia
          </h2>
          <p className="text-[#D1FAE5] text-lg max-w-3xl mx-auto leading-relaxed">
            Gangguan tidak menunggu anda bersedia. Sihir, jin asyik dan serangan mistik berlaku pada waktu yang paling tidak dijangka. Tanpa perlindungan yang sentiasa bersama anda, anda terdedah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#042E23] p-8 rounded-2xl border border-[#4ADE80]/20 hover:border-[#4ADE80]/40 transition-colors">
            <div className="text-4xl mb-4">🌙</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Diserang Waktu Malam Tanpa Pertolongan</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Perawat tidak boleh dihubungi tengah malam. Tapi gangguan tidak menunggu waktu pejabat — serangan berlaku bila jin mahu.
            </p>
          </div>
          
          <div className="bg-[#042E23] p-8 rounded-2xl border border-[#4ADE80]/20 hover:border-[#4ADE80]/40 transition-colors">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Ulang Alik Ke Perawat Tidak Putus-Putus</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Sembuh sekejap, datang balik. Kena pergi jumpa perawat lagi. Kos, masa dan tenaga terkuras — tapi akar masalah tidak selesai.
            </p>
          </div>

          <div className="bg-[#042E23] p-8 rounded-2xl border border-[#4ADE80]/20 hover:border-[#4ADE80]/40 transition-colors">
            <div className="text-4xl mb-4">💔</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Ahli Keluarga Tidak Ada Perlindungan</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Anak-anak, suami, isteri — mereka juga terdedah. Satu serangan boleh menjejas seluruh keluarga. Anda tidak boleh jaga semua orang serentak.
            </p>
          </div>

          <div className="bg-[#042E23] p-8 rounded-2xl border border-[#4ADE80]/20 hover:border-[#4ADE80]/40 transition-colors">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Terlupa Baca Wirid Di Saat Paling Perlukan</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Masa panik, fikiran kosong. Semua amalan hafalan hilang. Barang berisian bertindak balas sendiri — tanpa perlu anda ingat apa-apa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

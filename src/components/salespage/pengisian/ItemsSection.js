'use client';
import React from 'react';

export default function ItemsSection() {
  return (
    <section className="bg-[#042E23] py-16 px-4 font-inter relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#031E17] border border-[#FDE047]/30 text-[#FDE047] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
            💎 BARANG YANG BOLEH DIISI
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FEF3C7] mb-6 leading-tight">
            Pilih Barang Yang Paling Selalu Bersama Anda
          </h2>
          <p className="text-[#D1FAE5] text-lg max-w-3xl mx-auto leading-relaxed">
            Perawat ESyifaa buat pengisian secara jarak jauh — anda tidak perlu pos atau hantar barang ke mana-mana. Pilih barang yang selalu berada bersama anda untuk perlindungan maksimum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#031E17] p-8 rounded-2xl border border-[#4ADE80]/20 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#FDE047] text-[#042E23] text-xs font-bold px-3 py-1 rounded-full">
              Paling Popular
            </div>
            <div className="text-4xl mb-4">💍</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Cincin</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Paling berkesan — sentiasa di jari anda. Sentuhan terus dengan kulit memberikan kesan perlindungan yang berterusan.
            </p>
          </div>
          
          <div className="bg-[#031E17] p-8 rounded-2xl border border-[#4ADE80]/20 relative overflow-hidden">
            <div className="text-4xl mb-4">📿</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Tasbih</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Selalu dalam tangan ketika berzikir. Pengisian menjadikan setiap genggaman sebagai sumber kekuatan dan perlindungan.
            </p>
          </div>

          <div className="bg-[#031E17] p-8 rounded-2xl border border-[#4ADE80]/20 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#4ADE80] text-[#042E23] text-xs font-bold px-3 py-1 rounded-full">
              Popular
            </div>
            <div className="text-4xl mb-4">⌚</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Jam Tangan / Gelang</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Dipakai setiap hari, sentiasa di pergelangan tangan. Perlindungan yang tidak pernah tertanggal.
            </p>
          </div>

          <div className="bg-[#031E17] p-8 rounded-2xl border border-[#4ADE80]/20 relative overflow-hidden">
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-[#FDE047] text-xl font-bold mb-3">Barang Lain Yang Selalu Digunakan</h3>
            <p className="text-[#A7F3D0] leading-relaxed">
              Rantai, beg, telefon case, atau apa-apa sahaja yang sentiasa bersama anda. Bebas pilih barang yang paling bermakna.
            </p>
          </div>
        </div>

        <div className="bg-[#031E17] p-6 rounded-xl border border-[#FDE047]/20 text-center">
          <p className="text-[#FEF3C7]">
            📋 Nyatakan nama & jenis barang anda semasa mengisi borang tempahan. Perawat akan buat pengisian berdasarkan maklumat yang anda berikan.
          </p>
        </div>
      </div>
    </section>
  );
}

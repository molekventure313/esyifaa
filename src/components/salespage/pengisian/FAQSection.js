'use client';
import React from 'react';

export default function FAQSection() {
  const faqs = [
    {
      q: "Adakah pengisian boleh dilakukan dari jarak jauh — tanpa pos barang?",
      a: "Ya. Pengisian dilakukan secara jarak jauh menggunakan kaedah yang dibenarkan syarak — sama seperti rawatan jarak jauh. Anda tidak perlu pos atau hantar barang ke mana-mana. Cukup nyatakan nama dan jenis barang semasa mendaftar."
    },
    {
      q: "Berapa lama proses pengisian?",
      a: "Proses pengisian mengambil masa 7 hari berturut-turut dari tarikh tempahan. Selepas 7 hari, barang anda sudah siap dan boleh terus digunakan."
    },
    {
      q: "Apakah barang yang paling sesuai untuk diisikan?",
      a: "Apa-apa barang yang selalu bersama anda — cincin, tasbih, jam tangan, gelang, rantai. Semakin kerap barang itu bersama anda, semakin berkesan perlindungannya."
    },
    {
      q: "Adakah kekuatan pengisian akan berkurang dengan masa?",
      a: "Tidak. Perawat ESyifaa akan buat pelarasan dan pengisian semula setiap minggu secara automatik. Barang anda sentiasa pada kapasiti penuh tanpa anda perlu buat apa-apa."
    },
    {
      q: "Boleh saya gunakan barang yang sudah diisikan untuk rawat ahli keluarga?",
      a: "Ya. Barang yang sudah diisikan boleh digunakan untuk rawat diri sendiri dan ahli keluarga. Panduan lengkap cara penggunaan akan diberikan oleh perawat selepas pengisian selesai."
    },
    {
      q: "Adakah pengisian ini patuh syariah?",
      a: "Ya, 100%. Semua ayat yang diisikan adalah daripada Al-Quran dan doa-doa yang sabit daripada Sunnah Rasulullah SAW. Tiada unsur syirik atau amalan bertentangan syarak dalam proses pengisian ini."
    }
  ];

  return (
    <section className="bg-[#042E23] py-16 px-4 font-inter relative z-10 border-t border-[#031E17]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#031E17] border border-[#FDE047]/30 text-[#FDE047] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
            ❓ SOALAN LAZIM
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FEF3C7] mb-6 leading-tight">
            Soalan Yang Sering Ditanya
          </h2>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#031E17] p-6 md:p-8 rounded-2xl border border-[#4ADE80]/20 hover:border-[#4ADE80]/40 transition-colors">
              <h3 className="text-[#FDE047] text-lg md:text-xl font-bold mb-3">{faq.q}</h3>
              <p className="text-[#A7F3D0] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ruqyah Harian E-Syifa — 5 angle "gangguan berulang" (Framework FSP Pro 10%)
// Setiap angle: hero, masalah, fears, insight khusus, solution, goals, susunan testimoni, FAQ tambahan.
// Testimoni diambil daripada SP /ruqyah-harian (nama sahaja; disusun ikut kesesuaian angle).

export const ANGLES = {
  // ─── 1 ─ Lakonan masa rawatan (idea 1 + 7) ─────────────────────────────────
  1: {
    source: 'ruqyah-harian-1',
    hero: {
      pre: 'Meracau, muntah, disuruh mengucap pun boleh… semua sangka dah sembuh.',
      green: 'Tapi malam tu, bila sorang-sorang, ia datang balik.',
      sub: 'Apa yang nampak dalam bilik rawatan tak semestinya apa yang berlaku. Kini perawat E-Syifa bacakan ruqyah terus ke atas diri anda setiap pagi & malam — supaya ikhtiar tak berhenti bila sesi tamat. 👇🏻',
    },
    problems: {
      title: 'Masa berubat nampak "keluar"… lepas balik rumah, semuanya kembali',
      story: 'Masa dirawat badan menggigil, meracau, muntah. Lepas tu tenang dan boleh mengucap. Keluarga lega, perawat kata dah okey. Tapi bila tinggal seorang diri malam tu, rasa berat di bahu, bisikan dan mimpi ngeri datang semula.',
      items: [
        ['😮‍💨', 'Masa dirawat meracau & muntah — esoknya rasa sama semula'],
        ['🗣️', 'Boleh mengucap masa rawatan, tapi malam tu gangguan datang lagi'],
        ['🌑', 'Bila sorang-sorang, rasa diperhati & ditindih'],
        ['🔁', 'Setiap kali berubat "keluar" — tapi tak pernah betul-betul habis'],
        ['😵', 'Mimpi ngeri berulang, bangun penat walaupun tidur lama'],
        ['🚗', 'Dah tak larat ulang-alik jumpa perawat setiap kali ia kembali'],
      ],
    },
    fears: {
      title: 'Tanda "dah keluar" tu boleh jadi helah',
      paras: [
        ['Jin sihir boleh <y>berlakon</y>. Ia buat pesakit meracau dan muntah, kemudian "keluar" dan biarkan pesakit mengucap — supaya semua orang sangka rawatan dah selesai.'],
        ['Jin yang dihantar juga <y>bukan seekor</y>. Dalam satu sesi, mungkin seekor sahaja yang keluar, yang lain diam menyorok.'],
        ['Bila rawatan tamat dan pesakit bersendirian, <r>ia kembali</r>. Kalau dibiarkan, pesakit mula putus asa dan rasa "aku memang takkan sembuh". Sebab itu ikhtiar perlu diteruskan selepas sesi tamat — setiap hari.'],
      ],
    },
    insight: {
      type: 'compare',
      chip: '🎭 Apa Yang Nampak vs Apa Mungkin Berlaku',
      title: 'Babak biasa dalam rawatan — dan kenapa ia mengelirukan',
      cols: ['Apa yang nampak', 'Apa yang mungkin sebenarnya berlaku'],
      rows: [
        ['Pesakit meracau & menjerit', 'Jin bertindak balas — tapi belum tentu keluar'],
        ['Muntah, sendawa, menangis', 'Sebahagian gangguan ditolak keluar, dengan izin Allah'],
        ['Tenang & boleh mengucap', 'Jin mungkin hanya keluar sekejap / menyorok'],
        ['Perawat kata "dah okey"', 'Hanya seekor yang keluar; yang lain diam'],
        ['Malam tu sorang-sorang', 'Ia kembali — sebab tiada bacaan sehingga sesi seterusnya'],
      ],
      note: 'Ini bukan salah perawat — satu sesi memang terhad masanya. Yang hilang ialah kesinambungan bacaan selepas anda balik rumah.',
    },
    solution: 'Bila sesi rawatan tamat, Ruqyah Harian E-Syifa teruskan bacaan untuk anda — setiap pagi & malam, supaya jin tiada ruang untuk berlakon dan kembali',
    goals: {
      title: 'Bayangkan bila tiada lagi "datang balik" selepas berubat',
      items: ['Malam sorang-sorang tak lagi menakutkan', 'Tidur lena tanpa ditindih & mimpi ngeri', 'Badan ringan, ibadah lebih khusyuk', 'Tak perlu lagi kejar jadual perawat setiap kali ia kembali', 'Gangguan berkurangan hari demi hari, dengan izin Allah'],
    },
    testi: { order: ['Puan Hasnah', 'Tuan Fauzi', 'Encik Hafizuddin', 'Puan Syuhada', 'Puan Zaleha', 'Cikgu Nabilah', 'Puan Mariam', 'Encik Kamaruzzaman', 'Puan Noraini', 'Dr. Ariff'], title1: 'Mereka juga pernah "nampak sembuh" masa berubat' },
    faq: [['Kalau masa rawatan saya dah muntah & boleh mengucap, maknanya dah sembuh?', 'Belum tentu. Ia boleh jadi tanda sebahagian gangguan ditolak keluar, dengan izin Allah — tapi jin sihir boleh juga keluar sekejap dan kembali. Ukuran sebenar ialah keadaan anda bila bersendirian beberapa hari dan minggu selepas itu. Sebab itu bacaan perlu diteruskan setiap hari.']],
    closing: 'Jangan biar "lakonan" itu berulang lagi.',
    checkout: 'Jangan berhenti bila sesi tamat — teruskan bacaan <g>setiap hari</g>',
  },

  // ─── 2 ─ Hanya pesakit yang tahu (idea 3) ──────────────────────────────────
  2: {
    source: 'ruqyah-harian-2',
    hero: {
      pre: 'Masa berubat, semua nampak normal. Orang kata anda mengada-ngada…',
      green: 'tapi hanya anda yang tahu betapa sakitnya sihir ni.',
      sub: 'Kami percaya apa yang anda rasa. Perawat E-Syifa bacakan ruqyah terus ke atas diri anda setiap pagi & malam — walaupun orang lain tak nampak sakitnya. 👇🏻',
    },
    problems: {
      title: 'Sakit yang orang lain tak nampak — tapi anda tanggung setiap hari',
      story: 'Depan perawat, semuanya tenang. Tiada reaksi, tiada apa-apa. Balik rumah, bahu berat, dada sesak, emosi tak menentu. Bila cerita pada keluarga, mereka kata "perasaan je tu" atau "kurang iman". Lama-lama anda pun malas nak bercerita.',
      items: [
        ['🙈', 'Masa berubat tiada reaksi — perawat kata "tiada apa-apa"'],
        ['💬', 'Keluarga kata anda mengada-ngada atau "perasaan je"'],
        ['🌑', 'Sakit datang bila sorang-sorang, hilang bila ada orang'],
        ['😔', 'Penat menjelaskan — akhirnya pendam seorang diri'],
        ['😵', 'Tidur terganggu, bangun penat, emosi tak menentu'],
        ['❓', 'Mula ragu diri sendiri: "betul ke aku sakit?"'],
      ],
    },
    fears: {
      title: 'Bila tiada siapa percaya, pesakit mula berhenti berikhtiar',
      paras: [
        ['Jin sihir yang dihantar <y>bijak</y>. Waktu nak berubat, ia boleh keluar sekejap atau diam — jadi rawatan nampak "kosong" dan pesakit nampak sihat.'],
        ['Kesannya bukan sekadar fizikal. Pesakit yang tak dipercayai akan <r>berhenti bercerita, berhenti berubat</r>, dan menanggung seorang diri — sedangkan gangguan terus menekan dari hari ke hari.'],
        ['Ikhtiar anda tak sepatutnya bergantung pada sama ada orang lain nampak sakit itu. Ia perlu berjalan <y>setiap hari</y>, nampak atau tidak.'],
      ],
    },
    insight: {
      type: 'checklist',
      chip: '🤍 Kami Percaya Anda',
      title: 'Tanda-tanda yang hanya pesakit rasa',
      intro: 'Kalau anda alami beberapa daripada ini, anda bukan mengada-ngada. Ramai pesakit kami pernah lalui perkara yang sama:',
      items: ['Bahu & tengkuk berat bila sorang-sorang', 'Rasa diperhati atau ada "kelibat" di hujung mata', 'Dada sesak atau berdebar tanpa sebab perubatan yang jelas', 'Bisikan, was-was atau benci tiba-tiba pada orang tersayang', 'Rasa berat nak solat & baca Al-Quran', 'Mimpi berulang — ular, dikejar, jatuh atau makhluk hitam'],
      note: 'Ini bukan diagnosis. Sentiasa dapatkan pemeriksaan doktor untuk masalah kesihatan — ruqyah ialah ikhtiar rohani yang berjalan seiring rawatan perubatan.',
    },
    solution: 'Ruqyah Harian E-Syifa — ikhtiar yang berjalan untuk anda setiap pagi & malam, walaupun orang lain tak nampak apa yang anda tanggung',
    goals: {
      title: 'Bayangkan bila anda tak lagi menanggung seorang diri',
      items: ['Ada perawat yang bacakan ruqyah untuk anda setiap hari', 'Malam sorang-sorang terasa lebih tenang', 'Dada lapang, emosi lebih stabil', 'Solat & baca Al-Quran terasa ringan semula', 'Gangguan berkurangan hari demi hari, dengan izin Allah'],
    },
    testi: { order: ['Puan Syuhada', 'Puan Hasnah', 'Encik Hafizuddin', 'Cikgu Nabilah', 'Puan Zaleha', 'Dr. Ariff', 'Tuan Fauzi', 'Encik Kamaruzzaman', 'Puan Noraini', 'Puan Mariam'], title1: 'Mereka juga pernah rasa tiada siapa faham' },
    faq: [['Masa berubat saya tiada reaksi langsung. Maknanya saya tiada gangguan?', 'Tidak semestinya. Ada gangguan yang diam atau keluar sekejap semasa rawatan. Yang lebih penting ialah apa yang anda rasa dari hari ke hari. Ruqyah Harian dibaca setiap pagi & malam, jadi ikhtiar berjalan walaupun reaksi tak nampak semasa satu sesi. Untuk simptom fizikal, tetap dapatkan pemeriksaan doktor.']],
    closing: 'Anda tak perlu tanggung seorang diri lagi.',
    checkout: 'Mula dibacakan ruqyah <g>setiap hari</g> — walaupun orang lain tak nampak sakitnya',
  },

  // ─── 3 ─ Sihir hari-hari vs berubat sebulan sekali (idea 2 + 4) ─────────────
  3: {
    source: 'ruqyah-harian-3',
    hero: {
      pre: 'Sihir dihantar setiap hari. Anda berubat sebulan, atau 2–3 bulan sekali.',
      green: 'Macam mana nak menang?',
      sub: 'Serangan harian perlu dilawan dengan ikhtiar harian. Perawat E-Syifa bacakan ruqyah terus ke atas diri anda 2x sehari — ±60 bacaan sebulan, bukan sekali. 👇🏻',
    },
    problems: {
      title: 'Lega seminggu dua lepas berubat… kemudian kembali macam asal',
      story: 'Hari pertama lepas berubat, badan ringan. Minggu kedua, mula rasa berat semula. Minggu ketiga, tidur kembali terganggu. Bila tiba giliran berubat lagi, anda dah kembali ke tahap asal — dan pusingan yang sama berulang bertahun-tahun.',
      items: [
        ['📅', 'Berubat sebulan sekali — selebihnya hari tanpa ikhtiar'],
        ['📉', 'Lega seminggu dua, kemudian kembali ke tahap asal'],
        ['🔁', 'Pusingan sama berulang bertahun-tahun'],
        ['⏳', 'Tunggu giliran perawat berminggu-minggu'],
        ['📿', 'Nak amal sendiri setiap hari, tapi tak konsisten'],
        ['😩', 'Mula rasa macam takkan pernah selesai'],
      ],
    },
    fears: {
      title: '1 hari rawatan tak mampu kejar 29 hari serangan',
      paras: [
        ['Sihir yang kuat biasanya <y>dihantar berulang kali</y> — tukang sihir terus membaca dan menghantar, bukan sekali lalu berhenti.'],
        ['Kalau ikhtiar anda cuma sebulan sekali, ada <r>29 hari</r> di mana serangan berjalan tanpa dilawan. Kesan rawatan semalam tak semestinya bertahan menghadapi serangan esok.'],
        ['Inilah sebabnya ramai pesakit rasa "dah berubat banyak kali tapi tak habis-habis". Bukan rawatan tak berkesan — <y>kekerapannya</y> yang tak seimbang.'],
      ],
    },
    insight: {
      type: 'timeline',
      chip: '📆 Gambaran 30 Hari',
      title: 'Serangan setiap hari vs ikhtiar sebulan sekali',
      rowA: 'Berubat sebulan sekali',
      rowB: 'Ruqyah Harian E-Syifa',
      note: 'Setiap petak = 1 hari. Merah = hari serangan tanpa bacaan. Hijau = hari ada bacaan ruqyah (Ruqyah Harian: pagi & malam).',
    },
    solution: 'Ruqyah Harian E-Syifa — lawan serangan harian dengan bacaan ruqyah harian, 2x sehari, setiap hari sepanjang langganan',
    goals: {
      title: 'Bayangkan bila ikhtiar anda seiring dengan serangan',
      items: ['Tiada lagi hari "kosong" tanpa ruqyah', 'Lega yang bertahan, bukan seminggu dua sahaja', 'Benteng diri diperbaharui setiap pagi & malam', 'Tak lagi bergantung pada jadual perawat', 'Gangguan berkurangan hari demi hari, dengan izin Allah'],
    },
    testi: { order: ['Tuan Fauzi', 'Puan Hasnah', 'Puan Noraini', 'Encik Hafizuddin', 'Encik Kamaruzzaman', 'Puan Mariam', 'Puan Syuhada', 'Puan Zaleha', 'Cikgu Nabilah', 'Dr. Ariff'], title1: 'Bila bacaan dibuat setiap hari, bukan sebulan sekali' },
    faq: [['Kenapa perlu setiap hari? Tak cukup ke berubat sekali-sekala?', 'Rawatan sekali-sekala tetap ikhtiar yang baik. Tapi bila sihir dihantar berulang kali, ada hari-hari panjang tanpa sebarang bacaan di antara sesi. Ruqyah Harian mengisi jurang itu — 2x sehari, setiap hari.']],
    closing: 'Serangan setiap hari. Ikhtiar pun setiap hari.',
    checkout: 'Lawan serangan harian dengan bacaan <g>harian</g>',
  },

  // ─── 4 ─ Kira kos berubat (idea 5) ─────────────────────────────────────────
  4: {
    source: 'ruqyah-harian-4',
    hero: {
      pre: 'RM100–RM300 setiap kali berubat… balik rumah, gangguan datang lagi.',
      green: 'Dengan RM150 sebulan, anda dibacakan ruqyah setiap hari.',
      sub: '±60 bacaan ruqyah sebulan terus ke atas diri anda, pagi & malam — tanpa keluar rumah, tanpa tambang, tanpa ambil cuti. 👇🏻',
    },
    problems: {
      title: 'Duit habis, penat ulang-alik… tapi gangguan masih berulang',
      story: 'Sekali berubat, upah perawat, minyak kereta, tol, makan — dan kadang-kadang ambil cuti. Sebulan dua kali, dah beratus ringgit. Balik rumah lega sekejap, kemudian ia kembali, dan anda mula fikir: berapa banyak lagi yang perlu dibelanjakan?',
      items: [
        ['💸', 'Beratus ringgit sebulan untuk sesi rawatan'],
        ['🚗', 'Belanja minyak, tol & makan setiap kali pergi'],
        ['🏢', 'Kena ambil cuti atau tinggal kerja'],
        ['🔁', 'Lega sekejap, kemudian kena bayar lagi'],
        ['⏳', 'Beratur & tunggu giliran berjam-jam'],
        ['😩', 'Rasa rugi — duit habis, masalah masih sama'],
      ],
    },
    fears: {
      title: 'Bila gangguan berulang, kos pun berulang',
      paras: [
        ['Sihir yang dihantar berulang kali bermakna anda mungkin perlu <y>berubat berulang kali</y>. Setiap kali ia kembali, kos rawatan bermula semula.'],
        ['Lama-lama, ramai pesakit <r>berhenti berubat kerana kos</r> — bukan kerana dah sembuh. Dan bila ikhtiar berhenti, gangguan makin selesa.'],
        ['Rawatan bersemuka tetap ada tempatnya. Tapi untuk ikhtiar <y>harian</y>, perlu cara yang mampu diteruskan setiap hari.'],
      ],
    },
    insight: {
      type: 'cost',
      chip: '🧮 Kira Sendiri',
      title: 'Kos setiap bacaan ruqyah',
      note: 'Kos sesi rawatan ialah anggaran umum di pasaran; setiap perawat berbeza. Rawatan bersemuka & Ruqyah Harian boleh berjalan seiring — ini sekadar perbandingan kekerapan dan kos.',
    },
    solution: 'Ruqyah Harian E-Syifa — ±60 bacaan ruqyah sebulan terus ke atas diri anda, dengan satu bayaran yang mampu diteruskan',
    goals: {
      title: 'Bayangkan ikhtiar setiap hari tanpa kos berulang yang membebankan',
      items: ['Satu bayaran, bacaan setiap pagi & malam', 'Tiada lagi belanja minyak, tol & cuti kerja', 'Ikhtiar berterusan tanpa berhenti kerana kos', 'Tidur lena, badan ringan, emosi stabil', 'Gangguan berkurangan hari demi hari, dengan izin Allah'],
    },
    testi: { order: ['Puan Mariam', 'Tuan Fauzi', 'Dr. Ariff', 'Cikgu Nabilah', 'Puan Noraini', 'Puan Hasnah', 'Encik Hafizuddin', 'Puan Syuhada', 'Puan Zaleha', 'Encik Kamaruzzaman'], title1: 'Mereka dah kira — dan pilih bacaan setiap hari' },
    faq: [['Kenapa jauh lebih murah berbanding sesi rawatan?', 'Sesi bersemuka melibatkan masa perawat untuk seorang pesakit pada satu masa. Ruqyah Harian ialah bacaan jarak jauh atas nama pesakit, 2x sehari, dengan had 100 pendaftaran baru sebulan untuk jaga kualiti. Ia bukan ganti semua jenis rawatan, tetapi ikhtiar harian yang mampu diteruskan.']],
    closing: 'Berhenti bayar untuk lega sekejap.',
    checkout: 'Satu bayaran — dibacakan ruqyah <g>setiap hari</g>',
  },

  // ─── 5 ─ Punca di tangan tukang sihir (idea 6 + 7) ─────────────────────────
  5: {
    source: 'ruqyah-harian-5',
    hero: {
      pre: 'Gambar anda masih di tangan tukang sihir. Manteranya masih dibaca setiap hari.',
      green: 'Sebab itu ia berulang.',
      sub: 'Kita tak mampu rampas gambar itu atau hentikan manteranya. Yang dalam kawalan anda: rawat diri setiap hari. Perawat E-Syifa bacakan ruqyah terus ke atas diri anda pagi & malam. 👇🏻',
    },
    problems: {
      title: 'Dah berubat di banyak tempat… tapi kenapa ia tak pernah berhenti?',
      story: 'Anda dah cuba macam-macam. Setiap kali berubat, ada perubahan. Tapi beberapa hari kemudian, ia kembali, seolah-olah ada orang yang terus "menghantar". Dan memang itulah yang mungkin berlaku.',
      items: [
        ['🔁', 'Dah berubat banyak tempat, tapi gangguan tetap kembali'],
        ['📸', 'Risau gambar / barang peribadi digunakan untuk sihir'],
        ['🔥', 'Emosi tiba-tiba panas, benci pada pasangan atau keluarga'],
        ['🏪', 'Rezeki & perniagaan tersekat tanpa sebab jelas'],
        ['🌑', 'Gangguan datang semula terutama waktu malam'],
        ['😩', 'Rasa tak berdaya — "sampai bila nak macam ni?"'],
      ],
    },
    fears: {
      title: 'Selagi punca masih aktif, serangan boleh terus dihantar',
      paras: [
        ['Dalam banyak kes sihir, tukang sihir menggunakan <y>gambar, nama atau barang</y> pesakit dan membaca manteranya berulang kali. Tiada perawat — termasuk kami — yang boleh merampas gambar itu atau menghentikan bacaannya.'],
        ['Sihir juga boleh dihantar bersama <y>ramai jin</y>. Satu sesi rawatan mungkin hanya mengeluarkan seekor dua; yang lain kekal atau dihantar semula.'],
        ['Sebab itu kes sihir boleh berulang, <r>selagi tukang sihir tidak berhenti</r> — sama ada dia insaf atau meninggal dunia. Kita doakan dia diberi hidayah. Dan sementara itu, satu-satunya yang dalam kawalan anda ialah: rawat diri sendiri, setiap hari.'],
      ],
    },
    insight: {
      type: 'control',
      chip: '🧭 Apa Yang Dalam Kawalan Anda',
      title: 'Anda tak boleh hentikan tukang sihir — tapi anda boleh lindungi diri setiap hari',
      cant: ['Rampas gambar / barang anda daripada tukang sihir', 'Hentikan mantera yang dibaca setiap hari', 'Paksa tukang sihir insaf'],
      can: ['Berdoa & bertawakkal kepada Allah', 'Jaga solat, zikir pagi petang & bacaan Al-Quran', 'Pastikan diri dibacakan ruqyah setiap hari'],
      options: [
        ['📿', 'Pilihan 1: Amal sendiri', 'Baca ruqyah & zikir benteng sendiri setiap pagi & malam. Sangat baik — jika anda mampu istiqamah setiap hari.'],
        ['🌙', 'Pilihan 2: Ruqyah Harian E-Syifa', 'Untuk yang mahu mudah: perawat bacakan 4 lapisan ruqyah terus ke atas diri anda 2x sehari. Anda boleh amal sendiri juga — lebih baik.'],
      ],
    },
    solution: 'Ruqyah Harian E-Syifa — bila punca tak boleh dihentikan, pastikan diri anda dibacakan ruqyah setiap pagi & malam',
    goals: {
      title: 'Bayangkan bila serangan datang, benteng anda sentiasa diperbaharui',
      items: ['Tak lagi rasa tak berdaya menunggu serangan seterusnya', 'Benteng diri diperbaharui setiap pagi & malam', 'Emosi lebih tenang, rumahtangga lebih damai', 'Rezeki & urusan harian lebih lapang, in shaa Allah', 'Gangguan berkurangan hari demi hari, dengan izin Allah'],
    },
    testi: { order: ['Tuan Fauzi', 'Puan Zaleha', 'Puan Hasnah', 'Puan Noraini', 'Puan Syuhada', 'Encik Hafizuddin', 'Puan Mariam', 'Encik Kamaruzzaman', 'Cikgu Nabilah', 'Dr. Ariff'], title1: 'Bila sihir dihantar berulang, mereka pilih dibacakan setiap hari' },
    faq: [['Boleh ke E-Syifa hentikan tukang sihir atau musnahkan gambar saya?', 'Tidak. Kami tidak menjanjikan perkara itu, dan tiada perawat yang boleh merampas barang di tangan tukang sihir. Apa yang kami bantu ialah ikhtiar ke atas diri anda — bacaan ruqyah 2x sehari untuk melemahkan sihir dan menguatkan benteng, dengan izin Allah.']],
    closing: 'Punca di luar kawalan anda. Benteng diri — dalam kawalan anda.',
    checkout: 'Lindungi diri anda <g>setiap hari</g>, selagi serangan masih dihantar',
  },
};

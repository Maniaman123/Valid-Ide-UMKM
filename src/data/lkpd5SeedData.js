/**
 * src/data/lkpd5SeedData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Ground-truth metadata for LKPD 5 & 6 — UMKM Sepatu Keluarga ONLASHOES
 * Pengelola : Yola Afdalinda Ilmi
 * Kelas     : XI PPLG 2
 * Kelompok  : Nasya Fauziyyah · Nurrifka Aulia Rustaeni ·
 *             Raissa Wulan Noviana · Reyhan Septianto Ramadhan
 * ─────────────────────────────────────────────────────────────────────────────
 * Raw feasibility & impact scores are stored as integers 1–5 per LKPD rubric.
 * Quadrant classification is derived at runtime via quadrantLogic.js so this
 * file stays pure data with no business logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {GroupMeta} */
export const GROUP_META = {
  umkm:      'UMKM Sepatu Keluarga ONLASHOES',
  location:  'Bogor',
  manager:   'Yola Afdalinda Ilmi',
  class:     'XI PPLG 2',
  members: [
    'Nasya Fauziyyah',
    'Nurrifka Aulia Rustaeni',
    'Raissa Wulan Noviana',
    'Reyhan Septianto Ramadhan',
  ],
};

/**
 * SCAMPER key legend (single uppercase letter stored):
 *   S = Substitute  C = Combine    A = Adapt
 *   M = Modify      P = Put to other uses
 *   E = Eliminate   R = Reverse / Rearrange
 *
 * @type {IdeaSeed[]}
 */
export const SEED_IDEAS = [
  {
    id: 'idea-1',
    code: '#1',
    title: 'Tombol Tukar Size 1-Klik Tanpa Refund Uang',
    scamper: 'S',
    feasibility: 5,
    impact: 5,
    description:
      'Mengganti alur retur/refund sepihak dengan tiket tukar ukuran sepatu (37–40) langsung tanpa membatalkan pesanan atau menurunkan skor performa toko ONLASHOES.',
    justification:
      'Menggantikan proses refund konvensional dengan mekanisme tukar size instan, menghilangkan gesekan pengembalian dana dan meningkatkan kepuasan pelanggan secara signifikan.',
  },
  {
    id: 'idea-2',
    code: '#2',
    title: 'Sinkronisasi Stok Otomatis Antar Marketplace (Shopee, TikTok, Tokopedia)',
    scamper: 'S',
    feasibility: 3,
    impact: 5,
    description:
      'Menyamakan jumlah stok sepatu secara otomatis antara Shopee, TikTok Shop, dan Tokopedia agar tidak terjadi overselling.',
    justification:
      'Mensubstitusi pengelolaan stok manual di setiap platform dengan satu sistem terpusat; berdampak besar mengurangi overselling, namun kompleksitas integrasi API multi-marketplace menyebabkan keterlaksanaan sedang.',
  },
  {
    id: 'idea-3',
    code: '#3',
    title: 'Kalkulator Ukuran Kaki & Insole Interaktif',
    scamper: 'S',
    feasibility: 3,
    impact: 5,
    description:
      'Menghitung rekomendasi nomor sepatu pas berdasarkan input panjang telapak kaki (cm) dan tipe lebar kaki pembeli.',
    justification:
      'Mensubstitusi panduan size statis dengan kalkulator interaktif; menurunkan return rate secara drastis. Keterlaksanaan sedang karena memerlukan pengembangan UI yang presisi dan data insole yang tervalidasi.',
  },
  {
    id: 'idea-4',
    code: '#4',
    title: 'Filter Ulasan Berdasar Ukuran Kaki dan Warna',
    scamper: 'C',
    feasibility: 4,
    impact: 4,
    description:
      'Menyaring foto dan ulasan pembeli lain berdasarkan nomor sepatu dan warna yang sama sebagai referensi kecocokan.',
    justification:
      'Menggabungkan sistem ulasan dengan metadata produk untuk pengalaman belanja lebih relevan. Keterlaksanaan dan dampak sama-sama tinggi; memerlukan perubahan skema data ulasan.',
  },
  {
    id: 'idea-5',
    code: '#5',
    title: 'Kunci Tombol Batal Pesanan Saat Status Dikemas',
    scamper: 'E',
    feasibility: 5,
    impact: 5,
    description:
      'Menonaktifkan tombol batal sepihak di sisi pembeli begitu status pesanan masuk tahap pengemasan dan resi dicetak.',
    justification:
      'Mengeliminasi pembatalan pesanan mendadak saat sedang dikemas; melindungi seller dari kerugian operasional. Implementasi teknis sederhana — perubahan kondisi state pesanan.',
  },
  {
    id: 'idea-6',
    code: '#6',
    title: 'Scan QR & Foto Barang Sebelum Resi Dicetak',
    scamper: 'C',
    feasibility: 3,
    impact: 4,
    description:
      'Mewajibkan staf gudang memindai kode QR kardus sepatu dan memfoto isi paket sebelum label resi pengiriman keluar.',
    justification:
      'Menggabungkan verifikasi visual dan QR ke dalam alur cetak resi untuk bukti pengiriman yang lebih kuat. Dampak tinggi untuk penyelesaian sengketa; keterlaksanaan sedang karena integrasi perangkat keras scanner.',
  },
  {
    id: 'idea-7',
    code: '#7',
    title: 'Hitung Otomatis Keuntungan Bersih Penjual',
    scamper: 'S',
    feasibility: 5,
    impact: 5,
    description:
      'Menghitung otomatis potongan komisi admin dan volume kardus (14x28x10 cm) dari harga jual Rp95.000 agar margin bersih terlihat jelas.',
    justification:
      'Mensubstitusi perhitungan manual keuntungan dengan dashboard otomatis (harga jual − biaya produksi − komisi − ongkir). Sangat dibutuhkan UMKM dan mudah diimplementasikan.',
  },
  {
    id: 'idea-8',
    code: '#8',
    title: 'Pasang Voucher Ongkir Otomatis & Mode Tanpa Iklan',
    scamper: 'E',
    feasibility: 4,
    impact: 3,
    description:
      'Menghilangkan pop-up iklan yang menutupi layar pencarian dan otomatis memasangkan voucher ongkir terbaik saat checkout.',
    justification:
      'Mengeliminasi langkah manual klaim voucher ongkir dan gangguan iklan; meningkatkan UX seller. Dampak sedang karena tidak menyentuh core bisnis; keterlaksanaan tinggi.',
  },
  {
    id: 'idea-9',
    code: '#9',
    title: 'Kamera Bukti Komplain Langsung di Halaman Chat Toko',
    scamper: 'C',
    feasibility: 4,
    impact: 3,
    description:
      'Menyediakan tombol kamera langsung di dalam chat toko untuk memotret atau merekam bukti kendala tanpa unggah file besar.',
    justification:
      'Menggabungkan akses kamera langsung ke dalam chat toko untuk mempercepat proses klaim komplain. Keterlaksanaan tinggi; dampak sedang karena hanya relevan saat ada sengketa.',
  },
  {
    id: 'idea-10',
    code: '#10',
    title: 'Tukar Sepatu Langsung Antar-Pembeli Satu Kota',
    scamper: 'R',
    feasibility: 2,
    impact: 4,
    description:
      'Mencocokkan dua pembeli ONLASHOES di kota yang sama untuk bertukar nomor sepatu secara langsung via kurir instan.',
    justification:
      'Membalikkan model distribusi dengan membuka pertukaran peer-to-peer antarpembeli sekota. Dampak inovatif tinggi namun keterlaksanaan rendah — membutuhkan sistem kepercayaan, verifikasi, dan logistik hyperlocal.',
  },
];

export const LKPD5_SEED_IDEAS = SEED_IDEAS;

export default { GROUP_META, SEED_IDEAS, LKPD5_SEED_IDEAS };

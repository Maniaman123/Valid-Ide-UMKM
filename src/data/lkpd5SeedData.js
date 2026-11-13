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
    justification:
      'Membalikkan model distribusi dengan membuka pertukaran peer-to-peer antarpembeli sekota. Dampak inovatif tinggi namun keterlaksanaan rendah — membutuhkan sistem kepercayaan, verifikasi, dan logistik hyperlocal.',
  },
];

export default { GROUP_META, SEED_IDEAS };


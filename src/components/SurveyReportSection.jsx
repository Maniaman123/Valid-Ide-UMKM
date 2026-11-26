import React from 'react';
import { QUADRANT_META } from '../utils/quadrantLogic';

const QUADRANT_BADGE = {
  'PRIORITAS UTAMA': 'badge-q1',
  'POTENSI':         'badge-q2',
  'PERTIMBANGKAN':   'badge-q3',
  'TUNDA':           'badge-q4',
};

const REFLECTIONS = [
  {
    no: '01',
    question: 'Dari 10 ide yang dimasukkan, ide mana yang terpilih sebagai prioritas utama?',
    answer: `Ide yang terpilih adalah Tombol Tukar Size 1-Klik Tanpa Refund Uang (Kode #1) dengan Total Skor 10/10.
Ide ini memperoleh nilai Feasibility = 5 dan Impact = 5, keduanya masuk kategori Tinggi, sehingga ditempatkan di kuadran PRIORITAS UTAMA.
Berdasarkan logika LKPD 6, ide dengan posisi kuadran Tinggi × Tinggi dan total skor tertinggi langsung ditetapkan sebagai ide yang paling layak untuk segera dikembangkan.`,
  },
  {
    no: '02',
    question: 'Mengapa ide tersebut terpilih berdasarkan data skor Feasibility dan Impact?',
    answer: `Feasibility = 5 berarti ide ini sangat mudah direalisasikan secara teknis: hanya memerlukan perubahan logika status pesanan di backend marketplace, tanpa integrasi pihak ketiga.
Impact = 5 berarti dampaknya sangat besar terhadap bisnis ONLASHOES: menghilangkan friksi utama (proses refund manual yang memakan waktu 3–7 hari) dan langsung meningkatkan kepuasan pembeli.
Total Skor 10/10 (sempurna) mencerminkan keselarasan penuh antara kemampuan teknis tim dan kebutuhan nyata pelanggan UMKM Sepatu Keluarga ONLASHOES di Bogor.`,
  },
  {
    no: '03',
    question: 'Apakah ide dengan Total Score tertinggi selalu berarti ide terbaik untuk langsung dibuat?',
    answer: `Tidak selalu. Total Score hanya menggambarkan besarnya gabungan nilai; posisi kuadran yang menentukan tindakan konkret.
Contoh: Ide #2 (Sinkronisasi Stok Multi-Marketplace) dan Ide #3 (Kalkulator Ukuran Kaki) keduanya memiliki skor 8, namun karena Feasibility = 3 (Rendah) dan Impact = 5 (Tinggi), keduanya jatuh di kuadran POTENSI — artinya butuh riset dan penyederhanaan sebelum bisa dieksekusi.
Sebaliknya, Ide #8 (Voucher Ongkir Otomatis) memiliki skor 7 dan berada di PERTIMBANGKAN (Feasibility Tinggi, Impact Rendah) — lebih mudah dibuat, tapi dampaknya tidak sepadan dengan prioritas bisnis ONLASHOES saat ini.`,
  },
  {
    no: '04',
    question: 'Apa manfaat nyata grafik dan matriks dalam membantu mengambil keputusan?',
    answer: `Grafik Perbandingan Total Skor memungkinkan perbandingan cepat 10 ide secara visual hanya dalam satu pandangan, tanpa harus membaca tabel panjang satu per satu.
Matriks 3D Kuadran menambahkan dimensi ketiga (Total Skor sebagai ketinggian pin) sehingga posisi strategis setiap ide langsung terlihat secara spasial: ide yang tinggi dan berada di zona hijau (PRIORITAS UTAMA) adalah kandidat terbaik.
Kombinasi keduanya membuat proses pengambilan keputusan lebih objektif, berbasis data, dan jauh lebih cepat dibandingkan diskusi subjektif tanpa visualisasi.`,
  },
  {
    no: '05',
    question: 'Jika aplikasi ini dikembangkan lebih lanjut, fitur apa yang ingin ditambahkan?',
    answer: `Fitur survei langsung kepada pelanggan nyata ONLASHOES melalui Firebase Firestore: pembeli dapat memberi nilai Feasibility dan Impact dari perspektif mereka sendiri, kemudian sistem menghitung rata-rata skor komunitas secara real-time.
Hasilnya dapat dibandingkan dengan penilaian kelompok XI PPLG 2 untuk melihat apakah ada kesenjangan persepsi antara tim internal dan pengguna akhir.
Dengan data pelanggan yang valid, keputusan pengembangan fitur ONLASHOES akan lebih akurat, mengurangi risiko membangun fitur yang tidak dibutuhkan.`,
  },
];

export default function SurveyReportSection({ enrichedIdeas = [], quadrantGroups = {}, winner = null }) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <section
      aria-label="Laporan Hasil Survei LKPD 6"
      className="surface-card mb-6 overflow-hidden"
      data-print-section
    >
      {/* Report header */}
      <div className="px-5 sm:px-8 py-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
              DOKUMEN LKPD 6 — BAGIAN H
            </span>
            <h2 className="text-base sm:text-lg font-bold text-ink leading-tight">
              Laporan Hasil Survei & Refleksi Kelompok
            </h2>
            <p className="text-xs text-muted mt-0.5">
              UMKM Sepatu Keluarga ONLASHOES, Bogor &nbsp;·&nbsp; Pengelola: Yola Afdalinda Ilmi
            </p>
          </div>
          <div className="shrink-0 font-mono text-2xs text-muted text-right">
            <div>Kelas XI PPLG 2 — KIK 2026/2027</div>
            <div className="mt-0.5">{today}</div>
          </div>
        </div>

        {/* Quadrant summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {(['PRIORITAS UTAMA', 'POTENSI', 'PERTIMBANGKAN', 'TUNDA']).map((q) => {
            const meta  = QUADRANT_META[q];
            const count = quadrantGroups[q]?.length ?? 0;
            return (
              <div
                key={q}
                className={`p-3 border ${QUADRANT_BADGE[q]}`}
                style={{
                  backgroundColor: meta?.bg,
                  borderColor: meta?.border,
                }}
              >
                <span className="font-mono text-3xs uppercase tracking-wide block font-semibold" style={{ color: meta?.text }}>
                  {meta?.label ?? q}
                </span>
                <span className="font-mono text-xl font-bold" style={{ color: meta?.hex }}>
                  {count}
                </span>
                <span className="font-mono text-3xs block" style={{ color: meta?.text }}>
                  {count === 1 ? 'Ide' : 'Ide'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Winner callout (compact print-friendly) */}
      {winner && (
        <div className="px-5 sm:px-8 py-4 bg-q1-bg border-b border-q1-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="font-mono text-3xs uppercase tracking-widest font-semibold text-q1-text block mb-0.5">
                IDE TERPILIH — PRIORITAS UTAMA
              </span>
              <p className="text-sm font-bold text-ink">{winner.code} — {winner.title}</p>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs shrink-0">
              <span className="text-muted">F:<strong className="text-ink ml-0.5">{winner.feasibility}</strong></span>
              <span className="text-muted">I:<strong className="text-ink ml-0.5">{winner.impact}</strong></span>
              <span className="font-bold text-q1-text">Skor {winner.totalScore}/10</span>
            </div>
          </div>
        </div>
      )}

      {/* Reflection grid */}
      <div className="px-5 sm:px-8 py-6 space-y-6">
        <h3 className="font-mono text-2xs uppercase tracking-widest text-ink font-bold border-b border-border pb-2">
          PERTANYAAN REFLEKSI KELOMPOK
        </h3>

        {REFLECTIONS.map(({ no, question, answer }) => (
          <div key={no} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 break-inside-avoid print:break-inside-avoid">
            {/* Question */}
            <div className="sm:col-span-4">
              <div className="flex items-start gap-2">
                <span className="font-mono text-2xs font-bold text-brand shrink-0 mt-0.5">{no}</span>
                <p className="text-xs font-semibold text-ink leading-relaxed">{question}</p>
              </div>
            </div>
            {/* Answer */}
            <div className="sm:col-span-8">
              <div className="bg-sand border-l-2 border-brand px-4 py-3">
                {answer.split('\n').map((line, i) =>
                  line.trim() ? (
                    <p key={i} className="text-xs text-ink leading-relaxed mb-1.5 last:mb-0">
                      {line.trim()}
                    </p>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


import React from 'react';

/**
 * PrintReportHeader
 * Dedicated editorial A4 report header rendered exclusively during PDF/paper print.
 */
export default function PrintReportHeader() {
  return (
    <header className="hidden print:block mb-5 pb-4 border-b-2 border-[#171615]">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold block mb-1">
        LAPORAN HASIL SURVEI & VALIDASI IDE — KIK LKPD 6 (GANJIL 2026/2027)
      </span>
      <h1 className="text-lg font-bold text-[#171615] leading-snug mb-3">
        Aplikasi Validitas Ide Menggunakan Logika Quadran — UMKM Sepatu ONLASHOES
      </h1>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-[#171615] border-t border-[#E2DDD5] pt-2.5 font-sans">
        <div>
          <span className="font-mono font-semibold text-[#6B655E] uppercase">Kelas:</span>{' '}
          <strong className="font-semibold">XI PPLG 2</strong>
        </div>
        <div>
          <span className="font-mono font-semibold text-[#6B655E] uppercase">Studi Kasus:</span>{' '}
          <span>Toko Sepatu Keluarga ONLASHOES (Yola Afdalinda Ilmi, Bogor)</span>
        </div>
        <div className="col-span-2">
          <span className="font-mono font-semibold text-[#6B655E] uppercase">Anggota Kelompok:</span>{' '}
          <span>
            1. Nasya Fauziyyah &nbsp; 2. Nurrifka Aulia Rustaeni &nbsp; 3. Raissa Wulan Noviana &nbsp; 4. Reyhan Septianto Ramadhan
          </span>
        </div>
      </div>
    </header>
  );
}

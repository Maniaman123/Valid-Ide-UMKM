import React, { useState } from 'react';

/**
 * TopBar component for ONLASHOES Footwear Studio
 * Strict Swiss-grid layout with hairline 1px border.
 * Includes explicit modal confirmation for Reset to satisfy accidental-data-loss-prevention.
 */
export default function TopBar({ onReset, isResetting }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmReset = () => {
    setShowConfirm(false);
    onReset();
  };

  return (
    <>
      <header className="w-full bg-surface border-b border-border print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left Brand & Context */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-8 h-8 bg-brand flex items-center justify-center text-surface font-mono font-bold text-xs tracking-wider shrink-0"
              aria-hidden="true"
            >
              OS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xs tracking-widest uppercase font-semibold text-brand">
                  ONLASHOES STUDIO
                </span>
                <span className="text-border" aria-hidden="true">|</span>
                <span className="font-mono text-2xs tracking-wider text-muted uppercase">
                  BOGOR FOOTWEAR
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-ink leading-tight">
                Aplikasi Validitas Ide — Logika Kuadran
              </h1>
              <p className="text-xs text-muted font-normal mt-0.5">
                LKPD 6 • Kelas XI PPLG 2 (Nasya, Nurrifka, Raissa, Reyhan)
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isResetting}
              className="min-h-touch px-4 py-2 text-xs font-mono tracking-wide uppercase border border-border bg-surface text-ink hover:bg-sand focus-visible:outline-2 focus-visible:outline-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Kembalikan data ke 10 ide awal LKPD 5"
            >
              {isResetting ? 'Mereset Data...' : 'Reset 10 Ide LKPD 5'}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-touch px-4 py-2 text-xs font-mono tracking-wide uppercase bg-ink text-surface hover:bg-muted focus-visible:outline-2 focus-visible:outline-brand transition-colors"
            >
              Cetak Laporan PDF
            </button>
          </div>
        </div>
      </header>

      {/* Accidental Data Loss Prevention Confirmation Dialog */}
      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-grayscale-0 print-hide"
        >
          <div className="bg-surface border border-border max-w-md w-full p-6 shadow-none">
            <div className="border-b border-border pb-3 mb-4">
              <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-1">
                PERINGATAN INTEGRITAS DATA
              </span>
              <h2 id="confirm-reset-title" className="text-base font-bold text-ink">
                Konfirmasi Reset Data LKPD 5
              </h2>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-6">
              Tindakan ini akan menghapus semua ide baru atau perubahan skor yang telah Anda tambahkan
              dan mengembalikan daftar ke 10 ide original LKPD 5 UMKM ONLASHOES. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="min-h-touch px-4 py-2 text-xs font-mono tracking-wide uppercase border border-border bg-surface text-ink hover:bg-sand transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="min-h-touch px-4 py-2 text-xs font-mono tracking-wide uppercase bg-brand text-surface hover:opacity-90 transition-opacity"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


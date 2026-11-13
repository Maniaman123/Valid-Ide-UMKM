import React from 'react';

/**
 * SelectedPriorityBanner
 * Highlight card for the #1 ranked idea in PRIORITAS UTAMA.
 * Adheres strictly to the architectural Swiss-grid aesthetic:
 * 4px cognac border-l, tabular figures, and semantic badge.
 */
export default function SelectedPriorityBanner({ idea }) {
  if (!idea) {
    return (
      <section
        aria-label="Ide Prioritas Utama"
        className="w-full bg-surface border border-border border-l-4 border-l-brand p-5 mb-6"
      >
        <span className="font-mono text-2xs uppercase tracking-widest text-muted block mb-1">
          01 / IDE PRIORITAS UTAMA TERPILIH (SIAP DIKEMBANGKAN)
        </span>
        <p className="text-sm text-muted font-mono">
          Belum ada ide yang memenuhi kualifikasi kuadran PRIORITAS UTAMA.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Ide Prioritas Utama"
      className="w-full bg-surface border border-border border-l-4 border-l-brand p-5 sm:p-6 mb-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Left Column: Eyebrow, Title & HMW Justification */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold">
              01 / IDE PRIORITAS UTAMA TERPILIH (SIAP DIKEMBANGKAN)
            </span>
            <span className="font-mono text-2xs px-1.5 py-0.5 border border-border bg-sand text-ink">
              {idea.code || '#1'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight mb-2">
            {idea.title}
          </h2>

          <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-3xl">
            Solusi strategis HMW ONLASHOES: Mengatasi kendala tukar ukuran sepatu (size 37–40)
            secara langsung tanpa penalti refund uang, memangkas friksi operasional dan
            mempertahankan arus kas penjualan UMKM.
          </p>
        </div>

        {/* Right Column: Tabular Metric Strip */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono font-semibold uppercase tracking-wider badge-q1">
            <span className="w-1.5 h-1.5 rounded-full bg-q1-hex" aria-hidden="true" />
            PRIORITAS UTAMA
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-2xs text-ink">
            <div className="bg-sand/60 border border-border px-2 py-1.5 text-center">
              <span className="text-muted block text-3xs uppercase">FEASIBILITY</span>
              <span className="font-semibold text-xs text-ink">{idea.feasibility}/5</span>
            </div>
            <div className="bg-sand/60 border border-border px-2 py-1.5 text-center">
              <span className="text-muted block text-3xs uppercase">IMPACT</span>
              <span className="font-semibold text-xs text-ink">{idea.impact}/5</span>
            </div>
            <div className="bg-q1-bg border border-q1-border px-2 py-1.5 text-center">
              <span className="text-q1-text block text-3xs uppercase">TOTAL</span>
              <span className="font-bold text-xs text-q1-text">{idea.totalScore}/10</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


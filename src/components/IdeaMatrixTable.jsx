import React, { useState, useMemo, useCallback } from 'react';
import { QUADRANT_META } from '../utils/quadrantLogic';

const QUADRANT_BADGE = {
  'PRIORITAS UTAMA': 'badge-q1',
  'POTENSI':         'badge-q2',
  'PERTIMBANGKAN':   'badge-q3',
  'TUNDA':           'badge-q4',
};

const FILTERS = ['Semua', 'PRIORITAS UTAMA', 'POTENSI', 'PERTIMBANGKAN', 'TUNDA'];

export default function IdeaMatrixTable({
  enrichedIdeas = [],
  selectedIdeaId,
  onSelectIdea,
  onDeleteIdea,
}) {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const counts = useMemo(() => {
    const c = { Semua: enrichedIdeas.length };
    FILTERS.slice(1).forEach((q) => {
      c[q] = enrichedIdeas.filter((i) => i.quadrant === q).length;
    });
    return c;
  }, [enrichedIdeas]);

  const filtered = useMemo(() =>
    activeFilter === 'Semua'
      ? enrichedIdeas
      : enrichedIdeas.filter((i) => i.quadrant === activeFilter),
    [enrichedIdeas, activeFilter],
  );

  const handleDeleteClick = useCallback((e, id) => {
    e.stopPropagation();
    setPendingDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    onDeleteIdea?.(pendingDeleteId);
    setPendingDeleteId(null);
  }, [pendingDeleteId, onDeleteIdea]);

  return (
    <section aria-label="Tabel Matriks Ide LKPD 6" className="surface-card mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border">
        <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
          DATA LENGKAP LKPD 6
        </span>
        <h3 className="text-sm font-bold text-ink">Tabel Matriks Prioritas Ide ONLASHOES</h3>
      </div>

      {/* Filter tabs */}
      <div
        className="flex flex-wrap items-center gap-1 px-5 py-2.5 border-b border-border bg-sand print-hide"
        role="tablist"
        aria-label="Filter Kuadran"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={activeFilter === f}
            onClick={() => setActiveFilter(f)}
            className={`min-h-[32px] px-3 py-1 font-mono text-2xs uppercase tracking-wide border transition-colors ${
              activeFilter === f
                ? 'bg-ink text-surface border-ink'
                : 'bg-surface text-ink border-border hover:bg-canvas'
            }`}
          >
            {f === 'Semua' ? f : (QUADRANT_META[f]?.label ?? f)}
            <span className={`ml-1.5 font-bold ${activeFilter === f ? 'text-surface/80' : 'text-muted'}`}>
              {counts[f] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse" aria-label="Tabel ide inovasi LKPD 6">
          <thead>
            <tr className="bg-sand text-left">
              {['No', 'Nama Ide Fitur (ONLASHOES)', 'F', 'I', 'Skor', 'Kuadran', 'Aksi'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 py-2.5 font-mono text-2xs uppercase tracking-wider text-ink font-semibold border-b border-border whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-mono text-xs text-muted">
                  Tidak ada ide dalam kuadran ini.
                </td>
              </tr>
            ) : (
              filtered.map((idea) => {
                const isSelected = idea.id === selectedIdeaId;
                return (
                  <tr
                    key={idea.id ?? idea.code}
                    onClick={() => onSelectIdea?.(isSelected ? null : idea.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand/5 border-l-2 border-l-brand' : 'hover:bg-sand/50'
                    }`}
                    aria-selected={isSelected}
                  >
                    <td className="px-3 py-2.5 font-mono font-semibold text-muted whitespace-nowrap">
                      {idea.code}
                    </td>
                    <td className="px-3 py-2.5 text-ink font-medium max-w-[260px]">
                      <span className="line-clamp-2 leading-snug">{idea.title}</span>
                      {idea.scamper && (
                        <span className="mt-0.5 font-mono text-3xs text-muted block">
                          SCAMPER: {idea.scamper}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-ink tabular-nums text-center whitespace-nowrap">
                      {idea.feasibility}
                      <span className="font-normal text-muted">/5</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-ink tabular-nums text-center whitespace-nowrap">
                      {idea.impact}
                      <span className="font-normal text-muted">/5</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-ink tabular-nums text-center whitespace-nowrap">
                      {idea.totalScore}
                      <span className="font-normal text-muted">/10</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 font-mono text-3xs uppercase font-semibold tracking-wide ${QUADRANT_BADGE[idea.quadrant] ?? 'badge-q4'}`}>
                        {QUADRANT_META[idea.quadrant]?.label ?? idea.quadrant}
                      </span>
                      <span className="block font-mono text-3xs text-muted mt-0.5">
                        F:{idea.feasibilityLevel} I:{idea.impactLevel}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap print-hide">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, idea.id)}
                        className="min-h-[32px] px-2.5 py-1 font-mono text-3xs uppercase border border-border text-muted hover:border-red-400 hover:text-red-600 transition-colors"
                        aria-label={`Hapus ${idea.code}`}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Summary foot row */}
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-sand border-t-2 border-border">
                <td colSpan={2} className="px-3 py-2 font-mono text-2xs text-muted uppercase tracking-wide">
                  {filtered.length} Ide Ditampilkan
                </td>
                <td className="px-3 py-2 font-mono font-bold text-xs text-ink text-center tabular-nums">
                  {filtered.length > 0
                    ? (filtered.reduce((s, i) => s + i.feasibility, 0) / filtered.length).toFixed(1)
                    : '—'}
                </td>
                <td className="px-3 py-2 font-mono font-bold text-xs text-ink text-center tabular-nums">
                  {filtered.length > 0
                    ? (filtered.reduce((s, i) => s + i.impact, 0) / filtered.length).toFixed(1)
                    : '—'}
                </td>
                <td className="px-3 py-2 font-mono font-bold text-xs text-ink text-center tabular-nums">
                  {filtered.length > 0
                    ? (filtered.reduce((s, i) => s + i.totalScore, 0) / filtered.length).toFixed(1)
                    : '—'}
                </td>
                <td colSpan={2} className="px-3 py-2 font-mono text-2xs text-muted">Rata-rata Skor</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Delete confirmation modal */}
      {pendingDeleteId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-[1px] print-hide"
        >
          <div className="bg-surface border border-border max-w-sm w-full p-6 shadow-2xl relative z-[10000]">
            <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-1">
              KONFIRMASI HAPUS DATA
            </span>
            <h2 id="confirm-delete-title" className="text-sm font-bold text-ink mb-2">
              Hapus Ide dari Matriks?
            </h2>
            <p className="text-xs text-muted leading-relaxed mb-5">
              Ide ini akan dihapus dari daftar dan matriks kuadran. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="min-h-touch px-4 py-2 text-xs font-mono uppercase border border-border bg-surface text-ink hover:bg-sand transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="min-h-touch px-4 py-2 text-xs font-mono uppercase bg-ink text-surface hover:opacity-80 transition-opacity"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


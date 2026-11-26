import React, { useState, useMemo, useEffect } from 'react';
import { getAllPriorityIdeas } from '../utils/quadrantLogic';

const ITEMS_PER_PAGE = 5;

/**
 * SelectedPriorityBanner
 * Uniform grid displaying ALL ideas in the PRIORITAS UTAMA quadrant.
 * On screen: paginated (5/page) with collapsible descriptions.
 * On print: renders ALL priority ideas in a compact 2-column grid with concise descriptions visible.
 */
export default function SelectedPriorityBanner({ idea, ideas = [], onSelectIdea }) {
  const [expandedIds, setExpandedIds] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Derive all priority ideas sorted descending by totalScore, then ascending by original index
  const priorityIdeas = useMemo(() => {
    if (ideas && ideas.length > 0) {
      return getAllPriorityIdeas(ideas);
    }
    if (idea) {
      return [idea];
    }
    return [];
  }, [ideas, idea]);

  const totalPages = Math.max(1, Math.ceil(priorityIdeas.length / ITEMS_PER_PAGE));

  // Clamp current page when the number of ideas changes (e.g. deletion or reset)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (priorityIdeas.length === 0) {
    return (
      <section
        aria-label="Ide Prioritas Utama"
        className="w-full bg-surface border border-border border-l-4 border-l-brand p-5 mb-6 print-card"
      >
        <span className="font-mono text-2xs uppercase tracking-widest text-muted block mb-1">
          PRIORITAS UTAMA — SIAP DIKEMBANGKAN (0 IDE)
        </span>
        <p className="text-sm text-muted font-mono">
          Belum ada ide yang memenuhi kualifikasi kuadran PRIORITAS UTAMA.
        </p>
      </section>
    );
  }

  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = currentPage * ITEMS_PER_PAGE;
  const startIndex = pageStart + 1;
  const endIndex = Math.min(pageEnd, priorityIdeas.length);

  return (
    <section
      aria-label="Ide Prioritas Utama"
      className="w-full bg-surface border border-border p-5 sm:p-6 mb-6 print:p-4 print:mb-4"
    >
      {/* ── Single Panel Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-4 mb-4 border-b border-border print:pb-2.5 print:mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-q1-hex" aria-hidden="true" />
          <h2 className="font-mono text-xs sm:text-sm uppercase tracking-wider text-ink font-bold">
            PRIORITAS UTAMA — SIAP DIKEMBANGKAN ({priorityIdeas.length} IDE)
          </h2>
        </div>
        <span className="font-mono text-3xs text-muted tracking-wide print:hidden">
          Klik kartu untuk fokus di matriks 3D
        </span>
      </div>

      {/* ── Uniform Responsive Grid (All items rendered for print; sliced on screen) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start print:grid-cols-2 print:gap-2">
        {priorityIdeas.map((item, index) => {
          const isTopRanked = index === 0;
          const isExpanded = !!expandedIds[item.id];
          const inCurrentPage = index >= pageStart && index < pageEnd;

          return (
            <div
              key={item.id || item.code}
              onClick={() => onSelectIdea?.(item.id)}
              className={`${
                inCurrentPage ? 'flex' : 'hidden print:flex'
              } print-card bg-surface border p-4 print:p-2.5 flex-col gap-3 print:gap-1.5 min-w-0 overflow-hidden transition-colors cursor-pointer group ${
                isTopRanked
                  ? 'border-border border-l-4 border-l-brand bg-sand/20'
                  : 'border-border hover:bg-sand/40'
              }`}
            >
              {/* Card Header Strip */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-ink px-1.5 py-0.5 border border-border bg-sand">
                    {item.code}
                  </span>
                  {item.scamper && (
                    <span
                      className="font-mono text-3xs px-1.5 py-0.5 border border-border bg-surface text-ink font-semibold"
                      title={`Teknik SCAMPER: ${item.scamper}`}
                    >
                      {item.scamper}
                    </span>
                  )}
                  {isTopRanked && (
                    <span className="font-mono text-3xs px-1.5 py-0.5 border border-brand bg-brand/10 text-brand font-bold uppercase tracking-wider">
                      TERPILIH #1
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-mono text-2xs shrink-0">
                  <span className="text-muted text-3xs">
                    F:<strong className="text-ink">{item.feasibility}</strong> I:
                    <strong className="text-ink">{item.impact}</strong>
                  </span>
                  <span className="px-1.5 py-0.5 bg-q1-bg text-q1-text border border-q1-border font-bold text-3xs">
                    {item.totalScore}/10
                  </span>
                </div>
              </div>

              {/* Title with Strict Unbroken Text Wrapping */}
              <h3 className="text-sm print:text-xs font-bold text-ink group-hover:text-brand transition-colors break-words whitespace-pre-wrap leading-snug">
                {item.title}
              </h3>

              {/* Toggle Description Button & Action Row (screen only) */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 print:hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(item.id);
                  }}
                  className="min-h-[44px] px-3 py-1 text-xs font-mono border border-border bg-[#F7F5F0] hover:bg-[#EFECE6] text-[#171615] transition-colors inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-brand"
                  aria-expanded={isExpanded}
                >
                  <span>{isExpanded ? 'Tutup Deskripsi' : 'Lihat Deskripsi'}</span>
                  <span className="text-2xs font-bold">{isExpanded ? '▲' : '▼'}</span>
                </button>

                <span className="font-mono text-3xs text-q1-hex uppercase tracking-wider font-semibold">
                  Prioritas
                </span>
              </div>

              {/* Description Panel: toggled on screen, always concise & visible in print */}
              <div
                className={`${
                  isExpanded ? 'block' : 'hidden print:block'
                } p-3 print:p-2 bg-sand/60 border border-border text-xs print:text-[10px] leading-relaxed text-[#57534E] break-words whitespace-pre-wrap`}
              >
                <span className="font-mono text-3xs uppercase tracking-wider text-brand font-semibold block mb-1 print:hidden">
                  DESKRIPSI & MEKANISME FITUR:
                </span>
                <p className="text-xs print:text-[10px] leading-relaxed text-[#57534E] break-words whitespace-pre-wrap">
                  {item.description ||
                    item.justification ||
                    'Solusi fitur digital untuk mendukung operasional toko sepatu ONLASHOES.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination Bar (Active on screen when > 5 ideas; hidden on print) ── */}
      {priorityIdeas.length > ITEMS_PER_PAGE && (
        <div className="border-t border-[#E2DDD5] pt-4 mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <span className="font-mono text-2xs text-muted">
            Menampilkan {startIndex}–{endIndex} dari {priorityIdeas.length} ide Prioritas Utama
          </span>

          <div
            className="flex items-center gap-1.5"
            role="navigation"
            aria-label="Navigasi Halaman Prioritas Utama"
          >
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`min-h-[44px] px-3.5 text-xs font-mono border transition-colors ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-sand border-border text-muted'
                  : 'bg-surface text-ink border-border hover:bg-sand focus-visible:outline-2 focus-visible:outline-brand'
              }`}
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`min-h-[44px] min-w-[44px] px-2 text-xs font-mono font-bold border transition-colors ${
                  currentPage === page
                    ? 'bg-[#171615] text-[#FFFFFF] border-[#171615]'
                    : 'bg-[#FFFFFF] text-[#171615] border-[#E2DDD5] hover:bg-[#F7F5F0] focus-visible:outline-2 focus-visible:outline-brand'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`min-h-[44px] px-3.5 text-xs font-mono border transition-colors ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed bg-sand border-border text-muted'
                  : 'bg-surface text-ink border-border hover:bg-sand focus-visible:outline-2 focus-visible:outline-brand'
              }`}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

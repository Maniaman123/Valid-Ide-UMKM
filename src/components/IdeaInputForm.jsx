import React, { useState, useId } from 'react';
import {
  calculateTotal,
  classifyLevel,
  determineQuadrant,
  QUADRANT_META,
} from '../utils/quadrantLogic';

const SCALE_LABELS = {
  1: '1 (Sangat Rendah)',
  2: '2 (Rendah)',
  3: '3 (Sedang)',
  4: '4 (Tinggi)',
  5: '5 (Sangat Tinggi)',
};

/**
 * IdeaInputForm
 * Real-time simulation and entry for new footwear innovation ideas.
 * Features 44px touch targets on segmented scales, live score breakdown,
 * and seamless quadrant preview.
 */
export default function IdeaInputForm({ onAddIdea, onHoverIdea }) {
  const titleInputId = useId();
  const [title, setTitle] = useState('');
  const [feasibility, setFeasibility] = useState(4);
  const [impact, setImpact] = useState(4);
  const [justification, setJustification] = useState('');

  // Live real-time calculations
  const totalScore = calculateTotal(feasibility, impact);
  const feasibilityLevel = classifyLevel(feasibility);
  const impactLevel = classifyLevel(impact);
  const liveQuadrant = determineQuadrant(feasibility, impact);
  const quadMeta = QUADRANT_META[liveQuadrant];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newIdea = {
      title: title.trim(),
      feasibility: Number(feasibility),
      impact: Number(impact),
      scamper: 'M', // default Modify/New
      justification: justification.trim() || 'Simulasi skor langsung melalui form LKPD 6.',
    };

    onAddIdea(newIdea);
    setTitle('');
    setJustification('');
  };

  const handleMouseEnterPreview = () => {
    if (onHoverIdea) {
      onHoverIdea({
        title: title || 'Simulasi Ide Baru',
        feasibility,
        impact,
        totalScore,
        quadrant: liveQuadrant,
      });
    }
  };

  const handleMouseLeavePreview = () => {
    if (onHoverIdea) {
      onHoverIdea(null);
    }
  };

  return (
    <div className="surface-card p-5 sm:p-6 mb-6 print-hide">
      <div className="border-b border-border pb-3 mb-5">
        <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
          SIMULATOR SKOR & INPUT DATA
        </span>
        <h3 className="text-base font-bold text-ink">
          Input & Simulasi Skor Ide
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Tentukan nama fitur inovasi dan nilai skala 1–5 untuk menguji posisi kuadran secara langsung.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Ide Fitur */}
        <div>
          <label
            htmlFor={titleInputId}
            className="block text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-1.5"
          >
            Nama Ide Fitur
          </label>
          <input
            id={titleInputId}
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Fitur Notifikasi Restock Size 39"
            className="w-full min-h-touch px-3.5 py-2 text-sm bg-surface border border-border text-ink placeholder:text-muted/60 focus-visible:outline-2 focus-visible:outline-brand"
          />
        </div>

        {/* Feasibility 1-5 Segmented Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
              Feasibility / Keterlaksanaan (1–5)
            </span>
            <span className="text-2xs font-mono text-muted">
              Tingkat: <strong className="text-ink">{feasibilityLevel}</strong>
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Feasibility Scale">
            {[1, 2, 3, 4, 5].map((val) => {
              const active = feasibility === val;
              return (
                <button
                  key={`f-${val}`}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFeasibility(val)}
                  className={`min-h-touch px-2 py-2 text-xs font-mono transition-colors border ${
                    active
                      ? 'bg-ink text-surface border-ink font-bold'
                      : 'bg-surface text-ink border-border hover:bg-sand'
                  }`}
                  title={SCALE_LABELS[val]}
                >
                  <span className="block text-sm">{val}</span>
                  <span className="block text-3xs opacity-80 truncate hidden sm:block">
                    {val <= 3 ? 'Rendah' : 'Tinggi'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Impact 1-5 Segmented Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
              Impact / Dampak Strategis (1–5)
            </span>
            <span className="text-2xs font-mono text-muted">
              Tingkat: <strong className="text-ink">{impactLevel}</strong>
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Impact Scale">
            {[1, 2, 3, 4, 5].map((val) => {
              const active = impact === val;
              return (
                <button
                  key={`i-${val}`}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setImpact(val)}
                  className={`min-h-touch px-2 py-2 text-xs font-mono transition-colors border ${
                    active
                      ? 'bg-ink text-surface border-ink font-bold'
                      : 'bg-surface text-ink border-border hover:bg-sand'
                  }`}
                  title={SCALE_LABELS[val]}
                >
                  <span className="block text-sm">{val}</span>
                  <span className="block text-3xs opacity-80 truncate hidden sm:block">
                    {val <= 3 ? 'Rendah' : 'Tinggi'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Calculation Preview Box */}
        <div
          onMouseEnter={handleMouseEnterPreview}
          onMouseLeave={handleMouseLeavePreview}
          className="p-4 bg-sand border border-border"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="font-mono text-3xs uppercase tracking-widest text-muted block mb-0.5">
                HASIL KALKULASI LOGIKA KUADRAN
              </span>
              <div className="flex items-center gap-2 font-mono text-xs text-ink">
                <span>Skor: <strong>{totalScore}/10</strong> ({feasibility} + {impact})</span>
                <span className="text-border">|</span>
                <span>F: {feasibilityLevel}</span>
                <span className="text-border">|</span>
                <span>I: {impactLevel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono text-muted uppercase">Kuadran:</span>
              <span
                className={`inline-flex items-center px-2.5 py-1 text-2xs font-mono font-bold uppercase tracking-wider ${
                  quadMeta ? quadMeta.badgeClass : 'badge-q4'
                }`}
              >
                {liveQuadrant}
              </span>
            </div>
          </div>
          {quadMeta && (
            <p className="text-2xs text-muted font-mono mt-2 pt-2 border-t border-border/80">
              Rekomendasi: {quadMeta.action}
            </p>
          )}
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="w-full min-h-touch px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider bg-brand text-surface hover:opacity-95 focus-visible:outline-2 focus-visible:outline-brand transition-opacity"
        >
          Tambah ke Matriks
        </button>
      </form>
    </div>
  );
}


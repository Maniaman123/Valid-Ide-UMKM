import React, { useState, useEffect, useId } from 'react';
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

export const SCAMPER_OPTIONS = [
  { code: 'S', name: 'Substitute', label: 'Substitute (Mengganti alur/komponen)' },
  { code: 'C', name: 'Combine', label: 'Combine (Menggabungkan beberapa fungsi)' },
  { code: 'A', name: 'Adapt', label: 'Adapt (Menyesuaikan ide dari produk lain)' },
  { code: 'M', name: 'Modify', label: 'Modify (Memodifikasi ukuran/tampilan)' },
  { code: 'P', name: 'Put to Another Use', label: 'Put to Another Use (Pemanfaatan lain)' },
  { code: 'E', name: 'Eliminate', label: 'Eliminate (Menghilangkan proses berbelit)' },
  { code: 'R', name: 'Reverse', label: 'Reverse (Membalikkan alur konvensional)' },
];

/**
 * IdeaInputForm
 * Real-time simulation, creation, and editing for footwear innovation ideas.
 * Includes interactive SCAMPER technique selector, 44px touch targets,
 * and live calculation preview.
 */
export default function IdeaInputForm({
  onAddIdea,
  onUpdateIdea,
  editingIdea = null,
  onCancelEdit,
  onHoverIdea,
}) {
  const titleInputId = useId();
  const descInputId = useId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scamper, setScamper] = useState('S');
  const [feasibility, setFeasibility] = useState(4);
  const [impact, setImpact] = useState(4);
  const [justification, setJustification] = useState('');

  // Sync form state when entering or exiting edit mode
  useEffect(() => {
    if (editingIdea) {
      setTitle(editingIdea.title || '');
      setDescription(editingIdea.description || editingIdea.justification || '');
      setScamper(editingIdea.scamper || 'S');
      setFeasibility(Number(editingIdea.feasibility) || 4);
      setImpact(Number(editingIdea.impact) || 4);
      setJustification(editingIdea.justification || '');
    } else {
      setTitle('');
      setDescription('');
      setScamper('S');
      setFeasibility(4);
      setImpact(4);
      setJustification('');
    }
  }, [editingIdea]);

  // Live real-time calculations
  const totalScore = calculateTotal(feasibility, impact);
  const feasibilityLevel = classifyLevel(feasibility);
  const impactLevel = classifyLevel(impact);
  const liveQuadrant = determineQuadrant(feasibility, impact);
  const quadMeta = QUADRANT_META[liveQuadrant];

  const selectedScamperMeta = SCAMPER_OPTIONS.find((opt) => opt.code === scamper) || SCAMPER_OPTIONS[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalDesc =
      description.trim() ||
      editingIdea?.description ||
      'Solusi fitur digital untuk mendukung operasional toko sepatu ONLASHOES.';

    if (editingIdea) {
      const updatedIdea = {
        ...editingIdea,
        title: title.trim(),
        description: finalDesc,
        scamper,
        feasibility: Number(feasibility),
        impact: Number(impact),
        justification: justification.trim() || editingIdea.justification || 'Diperbarui melalui form LKPD 6.',
      };
      onUpdateIdea(updatedIdea);
    } else {
      const newIdea = {
        title: title.trim(),
        description: finalDesc,
        scamper,
        feasibility: Number(feasibility),
        impact: Number(impact),
        justification: justification.trim() || 'Simulasi skor langsung melalui form LKPD 6.',
      };
      onAddIdea(newIdea);
      setTitle('');
      setDescription('');
      setJustification('');
      setScamper('S');
    }
  };

  const handleMouseEnterPreview = () => {
    if (onHoverIdea) {
      onHoverIdea({
        id: editingIdea?.id,
        title: title || (editingIdea ? editingIdea.title : 'Simulasi Ide Baru'),
        description: description || editingIdea?.description || '',
        scamper,
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
    <div id="idea-input-form" className="surface-card p-5 sm:p-6 mb-6 print-hide print:hidden scroll-mt-6">
      <div className="border-b border-border pb-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
            {editingIdea ? `MODE EDIT AKTIF — ${editingIdea.code}` : 'SIMULATOR SKOR & INPUT DATA'}
          </span>
          {editingIdea && (
            <span className="px-2 py-0.5 font-mono text-3xs font-semibold uppercase bg-brand text-surface">
              Sedang Diedit
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-ink">
          {editingIdea ? `Edit Data Ide: ${editingIdea.code}` : 'Input & Simulasi Skor Ide'}
        </h3>
        <p className="text-xs text-muted mt-0.5">
          {editingIdea
            ? 'Ubah parameter judul, teknik SCAMPER, dan skala penilaian untuk memperbarui posisi ide.'
            : 'Tentukan nama fitur inovasi, teknik SCAMPER, dan nilai skala 1–5 untuk menguji posisi kuadran.'}
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

        {/* Deskripsi Ide Fitur */}
        <div>
          <label
            htmlFor={descInputId}
            className="block text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-1.5"
          >
            Deskripsi Ide Fitur
          </label>
          <textarea
            id={descInputId}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Mengirim notifikasi otomatis ke pembeli saat stok ukuran 39 kembali tersedia."
            className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-surface border border-border text-ink placeholder:text-muted/60 focus-visible:outline-2 focus-visible:outline-brand resize-y"
          />
        </div>

        {/* Teknik SCAMPER Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
              Teknik SCAMPER
            </span>
            <span className="text-2xs font-mono text-muted whitespace-nowrap shrink-0">
              Kode: <strong className="text-ink">{scamper}</strong>
            </span>
          </div>

          <div
            className="grid grid-cols-7 gap-1"
            role="radiogroup"
            aria-label="Pilihan Teknik SCAMPER"
          >
            {SCAMPER_OPTIONS.map((opt) => {
              const active = scamper === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setScamper(opt.code)}
                  className={`min-h-touch px-0.5 py-2 text-xs font-mono transition-colors border text-center ${
                    active
                      ? 'bg-ink text-surface border-ink font-bold'
                      : 'bg-surface text-ink border-border hover:bg-sand'
                  }`}
                  title={`${opt.code} — ${opt.name}`}
                >
                  <span className="block text-sm font-bold leading-none">{opt.code}</span>
                  <span className="block text-3xs opacity-60 leading-none mt-0.5">
                    {opt.name.split(' ')[0].slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-1.5 px-3 py-1.5 bg-sand/70 border border-border">
            <span className="font-mono text-2xs text-muted block">
              Terpilih:{' '}
              <strong className="text-ink font-semibold">
                {selectedScamperMeta.code} — {selectedScamperMeta.label}
              </strong>
            </span>
          </div>
        </div>

        {/* Feasibility 1-5 Segmented Selector */}
        <div>
          {/* Two-row label: title on top, badge below-right */}
          <div className="mb-1.5">
            <span className="block text-xs font-mono uppercase tracking-wider text-ink font-semibold">
              Feasibility / Keterlaksanaan (1–5)
            </span>
            <span className="block text-2xs font-mono text-muted mt-0.5">
              Tingkat saat ini:{' '}
              <strong className="text-ink">{feasibilityLevel}</strong>
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
                  <span className="block text-sm font-bold leading-none">{val}</span>
                  <span className="block text-3xs opacity-70 leading-none mt-0.5">
                    {val <= 3 ? 'Rendah' : 'Tinggi'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Impact 1-5 Segmented Selector */}
        <div>
          <div className="mb-1.5">
            <span className="block text-xs font-mono uppercase tracking-wider text-ink font-semibold">
              Impact / Dampak Strategis (1–5)
            </span>
            <span className="block text-2xs font-mono text-muted mt-0.5">
              Tingkat saat ini:{' '}
              <strong className="text-ink">{impactLevel}</strong>
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
                  <span className="block text-sm font-bold leading-none">{val}</span>
                  <span className="block text-3xs opacity-70 leading-none mt-0.5">
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
          <span className="font-mono text-3xs uppercase tracking-widest text-muted block mb-2">
            HASIL KALKULASI LOGIKA KUADRAN
          </span>

          {/* Row 1: Score + Quadrant badge */}
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="font-mono text-xs text-ink whitespace-nowrap">
              Skor: <strong className="text-base tabular-nums">{totalScore}</strong>
              <span className="text-muted">/10</span>
              <span className="text-muted ml-1 text-2xs">({feasibility}+{impact})</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-2xs font-mono text-muted uppercase whitespace-nowrap">Kuadran:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-2xs font-mono font-bold uppercase tracking-wider whitespace-nowrap ${
                  quadMeta ? quadMeta.badgeClass : 'badge-q4'
                }`}
              >
                {liveQuadrant}
              </span>
            </div>
          </div>

          {/* Row 2: F + I levels */}
          <div className="flex items-center gap-4 font-mono text-2xs text-muted border-t border-border/60 pt-1.5">
            <span>
              Feasibility:{' '}
              <strong className="text-ink font-semibold">{feasibilityLevel}</strong>
            </span>
            <span className="text-border/80">•</span>
            <span>
              Impact:{' '}
              <strong className="text-ink font-semibold">{impactLevel}</strong>
            </span>
          </div>

          {/* Row 3: Recommendation */}
          {quadMeta && (
            <p className="font-mono text-2xs text-muted mt-1.5 pt-1.5 border-t border-border/60">
              Rekomendasi: <span className="text-ink">{quadMeta.action}</span>
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2.5">
          {editingIdea && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 min-h-touch px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider border border-border bg-surface text-ink hover:bg-sand transition-colors"
            >
              Batal Edit
            </button>
          )}
          <button
            type="submit"
            className={`${
              editingIdea ? 'flex-1' : 'w-full'
            } min-h-touch px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider bg-brand text-surface hover:opacity-95 focus-visible:outline-2 focus-visible:outline-brand transition-opacity`}
          >
            {editingIdea ? 'Simpan Perubahan' : 'Tambah ke Matriks'}
          </button>
        </div>
      </form>
    </div>
  );
}

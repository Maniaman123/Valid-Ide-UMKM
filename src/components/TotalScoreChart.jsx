import React, { useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { QUADRANT_META } from '../utils/quadrantLogic';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const QUADRANT_COLORS = {
  'PRIORITAS UTAMA': '#059669',
  'POTENSI':         '#2563EB',
  'PERTIMBANGKAN':   '#D97706',
  'TUNDA':           '#64748B',
};

export default function TotalScoreChart({ enrichedIdeas = [], selectedIdeaId, onSelectIdea }) {
  const sorted = useMemo(
    () => [...enrichedIdeas].sort((a, b) => {
      const numA = parseInt(a.code?.replace('#', '') ?? '0', 10);
      const numB = parseInt(b.code?.replace('#', '') ?? '0', 10);
      return numA - numB;
    }),
    [enrichedIdeas],
  );

  const data = useMemo(() => ({
    labels: sorted.map((idea) => idea.code),
    datasets: [
      {
        label: 'Total Skor',
        data: sorted.map((idea) => idea.totalScore),
        backgroundColor: sorted.map((idea) =>
          idea.id === selectedIdeaId
            ? '#C85A32'
            : (QUADRANT_COLORS[idea.quadrant] ?? '#64748B') + 'CC',
        ),
        borderColor: sorted.map((idea) =>
          idea.id === selectedIdeaId
            ? '#C85A32'
            : QUADRANT_COLORS[idea.quadrant] ?? '#64748B',
        ),
        borderWidth: sorted.map((idea) => (idea.id === selectedIdeaId ? 2 : 1)),
        borderRadius: 2,
        barThickness: 22,
      },
    ],
  }), [sorted, selectedIdeaId]);

  const options = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    onClick: (_evt, elements) => {
      if (!elements.length) return;
      const idx = elements[0].index;
      const idea = sorted[idx];
      if (idea) onSelectIdea?.(idea.id === selectedIdeaId ? null : idea.id);
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171615',
        titleFont: { family: '"JetBrains Mono", monospace', size: 11 },
        bodyFont:  { family: '"JetBrains Mono", monospace', size: 11 },
        padding: 10,
        callbacks: {
          title: (items) => {
            const idea = sorted[items[0].dataIndex];
            return `${idea.code} ${idea.title}`;
          },
          label: (item) => {
            const idea = sorted[item.dataIndex];
            return [
              ` Total Skor: ${item.raw}/10`,
              ` Feasibility: ${idea.feasibility}  Impact: ${idea.impact}`,
              ` Kuadran: ${idea.quadrant}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 10,
        grid: { color: '#E2DDD5', lineWidth: 1 },
        border: { color: '#E2DDD5' },
        ticks: {
          font: { family: '"JetBrains Mono", monospace', size: 10 },
          color: '#6B655E',
          stepSize: 2,
        },
        title: {
          display: true,
          text: 'TOTAL SKOR (0–10)',
          font: { family: '"JetBrains Mono", monospace', size: 9, weight: '700' },
          color: '#6B655E',
          padding: { top: 6 },
        },
      },
      y: {
        grid: { display: false },
        border: { color: '#E2DDD5' },
        ticks: {
          font: { family: '"JetBrains Mono", monospace', size: 10, weight: '600' },
          color: '#171615',
        },
      },
    },
  }), [sorted, selectedIdeaId, onSelectIdea]);

  return (
    <section aria-label="Grafik Total Skor" className="surface-card mb-6 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
            ANALISIS KOMPARATIF
          </span>
          <h3 className="text-sm font-bold text-ink">
            Grafik Perbandingan Total Skor — Skala 10
          </h3>
        </div>
        {/* Quadrant color legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {Object.entries(QUADRANT_COLORS).map(([q, c]) => (
            <div key={q} className="flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5 border"
                style={{ backgroundColor: c + 'CC', borderColor: c }}
              />
              <span className="font-mono text-3xs uppercase text-muted">{QUADRANT_META[q]?.label ?? q}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 bg-brand border border-brand" />
            <span className="font-mono text-3xs uppercase text-muted">Dipilih</span>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5" style={{ height: `${Math.max(sorted.length * 36 + 60, 220)}px` }}>
        <Bar data={data} options={options} />
      </div>
      <p className="px-5 pb-3 font-mono text-3xs text-muted">
        Klik batang untuk menyorot ide pada Matriks 3D dan tabel di bawah. Bar berwarna cognac menandakan ide yang sedang dipilih.
      </p>
    </section>
  );
}


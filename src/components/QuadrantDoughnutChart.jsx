import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { QUADRANT_META } from '../utils/quadrantLogic';

ChartJS.register(ArcElement, Tooltip, Legend);

const QUADRANT_ORDER = [
  'PRIORITAS UTAMA',
  'POTENSI',
  'PERTIMBANGKAN',
  'TUNDA',
];

const QUADRANT_COLORS = {
  'PRIORITAS UTAMA': '#059669',
  'POTENSI': '#2563EB',
  'PERTIMBANGKAN': '#D97706',
  'TUNDA': '#64748B',
};

// Static Chart.js plugin to draw total count & label cleanly inside the cutout
// so it renders identically on screen and inside exported PNG print snapshots.
const centerTotalPlugin = {
  id: 'onlashoesDoughnutCenter',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const values = chart.data?.datasets?.[0]?.data ?? [];
    const total = values.reduce((sum, v) => sum + Number(v || 0), 0);
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#171615';
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillText(String(total), cx, cy - 8);

    ctx.fillStyle = '#6B655E';
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillText('TOTAL IDE', cx, cy + 12);
    ctx.restore();
  },
};

const QuadrantDoughnutChart = forwardRef(function QuadrantDoughnutChart(
  { enrichedIdeas = [], activeFilter = 'Semua', onFilterQuadrant },
  ref,
) {
  const chartRef = useRef(null);
  const [doughnutPrintImg, setDoughnutPrintImg] = useState(null);

  const stats = useMemo(() => {
    const total = enrichedIdeas.length;
    const counts = {
      'PRIORITAS UTAMA': 0,
      'POTENSI': 0,
      'PERTIMBANGKAN': 0,
      'TUNDA': 0,
    };
    enrichedIdeas.forEach((idea) => {
      if (counts[idea.quadrant] !== undefined) {
        counts[idea.quadrant] += 1;
      }
    });
    return {
      total,
      rows: QUADRANT_ORDER.map((q) => {
        const count = counts[q];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          quadrant: q,
          label: QUADRANT_META[q]?.label ?? q,
          color: QUADRANT_COLORS[q],
          count,
          pct,
        };
      }),
    };
  }, [enrichedIdeas]);

  const captureSnapshot = useCallback(() => {
    const inst = chartRef.current;
    if (!inst || typeof inst.toBase64Image !== 'function') return null;
    try {
      const dataUrl = inst.toBase64Image('image/png', 1);
      if (dataUrl) {
        setDoughnutPrintImg((prev) => (prev === dataUrl ? prev : dataUrl));
      }
      return dataUrl;
    } catch {
      return null;
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      captureSnapshot,
      capturePrintSnapshot: captureSnapshot,
    }),
    [captureSnapshot],
  );

  useEffect(() => {
    const onBeforePrint = () => {
      captureSnapshot();
    };
    const onAfterPrint = () => {
      chartRef.current?.resize?.();
    };
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [captureSnapshot]);

  useEffect(() => {
    const timer = setTimeout(() => {
      captureSnapshot();
    }, 350);
    return () => clearTimeout(timer);
  }, [stats, activeFilter, captureSnapshot]);

  const data = useMemo(
    () => ({
      labels: stats.rows.map((r) => r.label),
      datasets: [
        {
          data: stats.rows.map((r) => r.count),
          backgroundColor: stats.rows.map((r) =>
            activeFilter === 'Semua' || activeFilter === r.quadrant
              ? r.color
              : r.color + '40',
          ),
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    }),
    [stats, activeFilter],
  );

  const handleToggleQuadrant = useCallback(
    (quadrant) => {
      if (!onFilterQuadrant) return;
      onFilterQuadrant(activeFilter === quadrant ? 'Semua' : quadrant);
    },
    [activeFilter, onFilterQuadrant],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      animation: {
        duration: 300,
        onComplete: () => {
          const inst = chartRef.current;
          if (inst && typeof inst.toBase64Image === 'function') {
            try {
              const url = inst.toBase64Image('image/png', 1);
              if (url) setDoughnutPrintImg((prev) => (prev === url ? prev : url));
            } catch {
              // ignore read error
            }
          }
        },
      },
      onClick: (_evt, elements) => {
        if (!elements.length) return;
        const idx = elements[0].index;
        const target = stats.rows[idx];
        if (target) handleToggleQuadrant(target.quadrant);
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#171615',
          titleFont: { family: '"JetBrains Mono", monospace', size: 11 },
          bodyFont: { family: '"JetBrains Mono", monospace', size: 11 },
          padding: 10,
          callbacks: {
            label: (ctx) => {
              const row = stats.rows[ctx.dataIndex];
              return ` ${row.count} ide (${row.pct}%)`;
            },
          },
        },
      },
    }),
    [stats, handleToggleQuadrant],
  );

  return (
    <section
      aria-label="Distribusi Kuadran"
      className="surface-card print-card h-full flex flex-col overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-border">
        <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
          PROPORSI KUADRAN
        </span>
        <h3 className="text-sm font-bold text-ink">
          Distribusi Ide per Kuadran LKPD 6
        </h3>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4 print:p-3 print:gap-2.5">
        {/* Interactive Doughnut (screen only) */}
        <div className="print:hidden relative h-[210px] w-full flex items-center justify-center">
          <Doughnut
            ref={chartRef}
            data={data}
            options={options}
            plugins={[centerTotalPlugin]}
          />
        </div>

        {/* Print Snapshot Image */}
        {doughnutPrintImg && (
          <img
            src={doughnutPrintImg}
            alt="Distribusi Ide per Kuadran LKPD 6"
            className="hidden print:block w-[220px] h-[220px] mx-auto object-contain"
          />
        )}

        {/* Structured Legend Breakdown */}
        <ul className="divide-y divide-border border-t border-border pt-1">
          {stats.rows.map((row) => {
            const isActive = activeFilter === row.quadrant;
            return (
              <li key={row.quadrant}>
                <button
                  type="button"
                  onClick={() => handleToggleQuadrant(row.quadrant)}
                  className={`print-keep w-full min-h-[36px] print:min-h-0 px-2 py-1.5 print:py-1 flex items-center justify-between gap-2 text-left transition-colors ${
                    isActive
                      ? 'bg-sand font-semibold'
                      : 'hover:bg-sand/60'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 shrink-0 inline-block"
                      style={{ backgroundColor: row.color }}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-2xs uppercase tracking-wide text-ink truncate">
                      {row.label}
                    </span>
                  </span>
                  <span className="font-mono text-2xs text-ink tabular-nums shrink-0">
                    <strong>{row.count} ide</strong>{' '}
                    <span className="text-muted">({row.pct}%)</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="px-5 pb-3 font-mono text-3xs text-muted print:hidden">
        Klik segmen atau kuadran untuk menyaring tabel di bawah.
      </p>
    </section>
  );
});

export default QuadrantDoughnutChart;

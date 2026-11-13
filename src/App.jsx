import React, { useState, useEffect, useMemo } from 'react';
import TopBar from './components/TopBar';
import SelectedPriorityBanner from './components/SelectedPriorityBanner';
import IdeaInputForm from './components/IdeaInputForm';
import { loadIdeas, saveIdeas, resetToSeedData } from './services/storageService';
import { enrichAll, getSelectedPriorityIdea, groupByQuadrant } from './utils/quadrantLogic';

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [hoveredIdea, setHoveredIdea] = useState(null);

  // Initialize data on mount
  useEffect(() => {
    let mounted = true;
    async function initData() {
      try {
        const loaded = await loadIdeas();
        if (mounted) setIdeas(loaded);
      } catch (err) {
        console.error('[App] Failed to load ideas:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    initData();
    return () => {
      mounted = false;
    };
  }, []);

  // Derived state via pure quadrant logic
  const enrichedIdeas = useMemo(() => enrichAll(ideas), [ideas]);
  const winnerIdea = useMemo(() => getSelectedPriorityIdea(enrichedIdeas), [enrichedIdeas]);
  const quadrantGroups = useMemo(() => groupByQuadrant(enrichedIdeas), [enrichedIdeas]);

  // Handler: Add new simulated idea
  const handleAddIdea = async (newIdeaData) => {
    const nextCode = `#${ideas.length + 1}`;
    const nextId = `idea-${Date.now()}`;
    const newEntry = {
      id: nextId,
      code: nextCode,
      ...newIdeaData,
    };
    const updated = [...ideas, newEntry];
    setIdeas(updated);
    try {
      await saveIdeas(updated);
    } catch (err) {
      console.error('[App] Failed to save updated ideas:', err);
    }
  };

  // Handler: Reset to LKPD 5 ground-truth seed
  const handleReset = async () => {
    setIsResetting(true);
    try {
      const restored = await resetToSeedData();
      setIdeas(restored);
    } catch (err) {
      console.error('[App] Failed to reset seed data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-brand selection:text-surface">
      {/* 1. Global Header */}
      <TopBar onReset={handleReset} isResetting={isResetting} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="surface-card p-12 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              MEMUAT DATA MATRIKS ONLASHOES...
            </span>
          </div>
        ) : (
          <>
            {/* 2. Architectural Winner Banner */}
            <SelectedPriorityBanner idea={winnerIdea} />

            {/* 3. Primary Grid: Input Form & Quadrant Distribution Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form (5 Cols) */}
              <div className="lg:col-span-5">
                <IdeaInputForm
                  onAddIdea={handleAddIdea}
                  onHoverIdea={setHoveredIdea}
                />
              </div>

              {/* Right Column: Live Data Feed & Quadrant Summary (7 Cols) */}
              <div className="lg:col-span-7">
                <section
                  aria-label="Ringkasan Kuadran Saat Ini"
                  className="surface-card p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <div>
                      <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
                        DISTRIBUSI IDE AKTIF
                      </span>
                      <h3 className="text-base font-bold text-ink">
                        Ringkasan 4 Kuadran ({ideas.length} Ide Terdaftar)
                      </h3>
                    </div>
                    {hoveredIdea && (
                      <span className="font-mono text-2xs text-brand border border-brand/40 bg-sand px-2 py-0.5">
                        Simulasi Aktif: {hoveredIdea.quadrant}
                      </span>
                    )}
                  </div>

                  {/* 4 Quadrants Pill Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    <div className="p-3 border border-q1-border bg-q1-bg">
                      <span className="font-mono text-3xs uppercase tracking-wider text-q1-text block">
                        PRIORITAS UTAMA
                      </span>
                      <span className="font-mono text-xl font-bold text-q1-text">
                        {quadrantGroups['PRIORITAS UTAMA'].length}
                      </span>
                    </div>

                    <div className="p-3 border border-q2-border bg-q2-bg">
                      <span className="font-mono text-3xs uppercase tracking-wider text-q2-text block">
                        POTENSI
                      </span>
                      <span className="font-mono text-xl font-bold text-q2-text">
                        {quadrantGroups['POTENSI'].length}
                      </span>
                    </div>

                    <div className="p-3 border border-q3-border bg-q3-bg">
                      <span className="font-mono text-3xs uppercase tracking-wider text-q3-text block">
                        PERTIMBANGKAN
                      </span>
                      <span className="font-mono text-xl font-bold text-q3-text">
                        {quadrantGroups['PERTIMBANGKAN'].length}
                      </span>
                    </div>

                    <div className="p-3 border border-q4-border bg-q4-bg">
                      <span className="font-mono text-3xs uppercase tracking-wider text-q4-text block">
                        TUNDA
                      </span>
                      <span className="font-mono text-xl font-bold text-q4-text">
                        {quadrantGroups['TUNDA'].length}
                      </span>
                    </div>
                  </div>

                  {/* Recent List View */}
                  <div className="border border-border">
                    <div className="bg-sand px-3 py-2 border-b border-border font-mono text-2xs uppercase tracking-wider text-ink font-semibold flex items-center justify-between">
                      <span>Daftar Ide Terbaru</span>
                      <span className="text-muted font-normal">F × I | Skor</span>
                    </div>
                    <ul className="divide-y divide-border max-h-80 overflow-y-auto">
                      {enrichedIdeas.map((item) => (
                        <li
                          key={item.id || item.code}
                          className="px-3 py-2.5 flex items-center justify-between text-xs hover:bg-sand/40 transition-colors"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-2xs text-muted">
                                {item.code}
                              </span>
                              <span className="font-medium text-ink truncate">
                                {item.title}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 font-mono text-2xs">
                            <span className="text-muted">
                              F:{item.feasibility} I:{item.impact}
                            </span>
                            <span className="font-bold text-ink w-6 text-right">
                              {item.totalScore}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 text-3xs uppercase font-semibold ${
                                item.quadrant === 'PRIORITAS UTAMA'
                                  ? 'badge-q1'
                                  : item.quadrant === 'POTENSI'
                                  ? 'badge-q2'
                                  : item.quadrant === 'PERTIMBANGKAN'
                                  ? 'badge-q3'
                                  : 'badge-q4'
                              }`}
                            >
                              {item.quadrant}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

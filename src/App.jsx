import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TopBar from './components/TopBar';
import SelectedPriorityBanner from './components/SelectedPriorityBanner';
import IdeaInputForm from './components/IdeaInputForm';
import Quadrant3DMatrix from './components/Quadrant3DMatrix';
import TotalScoreChart from './components/TotalScoreChart';
import IdeaMatrixTable from './components/IdeaMatrixTable';
import { loadIdeas, saveIdeas, resetToSeedData } from './services/storageService';
import { enrichAll, getSelectedPriorityIdea, groupByQuadrant } from './utils/quadrantLogic';

export default function App() {
  const [ideas, setIdeas]               = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isResetting, setIsResetting]   = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [editingIdea, setEditingIdea]   = useState(null);

  // ── Bootstrap ───────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await loadIdeas();
        if (mounted) setIdeas(loaded);
      } catch (err) {
        console.error('[App] loadIdeas failed:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────
  const enrichedIdeas   = useMemo(() => enrichAll(ideas), [ideas]);
  const winnerIdea      = useMemo(() => getSelectedPriorityIdea(enrichedIdeas), [enrichedIdeas]);
  const quadrantGroups  = useMemo(() => groupByQuadrant(enrichedIdeas), [enrichedIdeas]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddIdea = useCallback(async (newIdeaData) => {
    const newEntry = {
      id:   `idea-${Date.now()}`,
      code: `#${ideas.length + 1}`,
      ...newIdeaData,
    };
    const updated = [...ideas, newEntry];
    setIdeas(updated);
    try { await saveIdeas(updated); } catch (e) { console.error(e); }
  }, [ideas]);

  const handleUpdateIdea = useCallback(async (updatedIdeaData) => {
    const updated = ideas.map((idea) =>
      idea.id === updatedIdeaData.id ? { ...idea, ...updatedIdeaData } : idea
    );
    setIdeas(updated);
    setEditingIdea(null);
    try { await saveIdeas(updated); } catch (e) { console.error(e); }
  }, [ideas]);

  const handleStartEdit = useCallback((idea) => {
    setEditingIdea(idea);
    setSelectedIdeaId(idea.id);
    document.getElementById('idea-input-form')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingIdea(null);
  }, []);

  const handleDeleteIdea = useCallback(async (id) => {
    const updated = ideas.filter((i) => i.id !== id);
    setIdeas(updated);
    if (selectedIdeaId === id) setSelectedIdeaId(null);
    if (editingIdea?.id === id) setEditingIdea(null);
    try { await saveIdeas(updated); } catch (e) { console.error(e); }
  }, [ideas, selectedIdeaId, editingIdea]);

  const handleReset = useCallback(async () => {
    setIsResetting(true);
    try {
      const restored = await resetToSeedData();
      setIdeas(restored);
      setSelectedIdeaId(null);
      setEditingIdea(null);
    } catch (e) {
      console.error('[App] reset failed:', e);
    } finally {
      setIsResetting(false);
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-brand selection:text-surface">
      {/* ① Top navigation bar */}
      <TopBar onReset={handleReset} isResetting={isResetting} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="surface-card p-16 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-muted block">
              MEMUAT DATA MATRIKS ONLASHOES...
            </span>
          </div>
        ) : (
          <>
            {/* ② Winner banner — always visible */}
            <SelectedPriorityBanner idea={winnerIdea} />

            {/* ③ Primary workspace: 4-col form + 8-col 3D matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              <div className="lg:col-span-4">
                <IdeaInputForm
                  onAddIdea={handleAddIdea}
                  onUpdateIdea={handleUpdateIdea}
                  editingIdea={editingIdea}
                  onCancelEdit={handleCancelEdit}
                  onHoverIdea={(h) => { if (h) setSelectedIdeaId(h.id ?? null); }}
                />
              </div>
              <div className="lg:col-span-8">
                <Quadrant3DMatrix
                  enrichedIdeas={enrichedIdeas}
                  selectedIdeaId={selectedIdeaId}
                  onSelectIdea={setSelectedIdeaId}
                />
              </div>
            </div>

            {/* ④ Horizontal bar chart — shared selectedIdeaId */}
            <TotalScoreChart
              enrichedIdeas={enrichedIdeas}
              selectedIdeaId={selectedIdeaId}
              onSelectIdea={setSelectedIdeaId}
            />

            {/* ⑤ Full LKPD 6 data table with filter, sort & delete */}
            <IdeaMatrixTable
              enrichedIdeas={enrichedIdeas}
              selectedIdeaId={selectedIdeaId}
              onSelectIdea={setSelectedIdeaId}
              onEditIdea={handleStartEdit}
              onDeleteIdea={handleDeleteIdea}
            />
          </>
        )}
      </main>

      {/* Minimal print footer */}
      <footer className="hidden print:block border-t border-border px-8 py-3 font-mono text-3xs text-muted">
        Aplikasi Validitas Ide UMKM ONLASHOES · LKPD 5&6 · Kelas XI PPLG 2 · KIK 2026/2027
      </footer>
    </div>
  );
}

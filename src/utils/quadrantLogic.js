/**
 * src/utils/quadrantLogic.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure functional business logic for LKPD 6 Prioritization Matrix.
 *
 * LKPD 6 rubric:
 *   Feasibility & Impact each rated 1–5.
 *   Level classification threshold:
 *     ≥ 4  → 'Tinggi'
 *     1–3  → 'Rendah'
 *
 * Quadrant mapping (Feasibility × Impact):
 *   Tinggi × Tinggi  → PRIORITAS UTAMA
 *   Rendah × Tinggi  → POTENSI
 *   Tinggi × Rendah  → PERTIMBANGKAN
 *   Rendah × Rendah  → TUNDA
 *
 * All functions are pure (no side effects, no I/O).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @typedef {'Tinggi'|'Rendah'} Level */
/** @typedef {'PRIORITAS UTAMA'|'POTENSI'|'PERTIMBANGKAN'|'TUNDA'} Quadrant */

/**
 * Sum feasibility and impact into a total score.
 *
 * @param {number|string} feasibility - Raw score 1–5
 * @param {number|string} impact      - Raw score 1–5
 * @returns {number} Integer total 2–10
 */
export function calculateTotal(feasibility, impact) {
  return Number(feasibility) + Number(impact);
}

/**
 * Map a single axis score (1–5) to its qualitative level.
 *
 * @param {number|string} score - Axis score 1–5
 * @returns {Level}
 */
export function classifyLevel(score) {
  return Number(score) >= 4 ? 'Tinggi' : 'Rendah';
}

/**
 * Determine which quadrant an idea falls into based on feasibility × impact.
 *
 * @param {number|string} feasibility - Raw feasibility score 1–5
 * @param {number|string} impact      - Raw impact score 1–5
 * @returns {Quadrant}
 */
export function determineQuadrant(feasibility, impact) {
  const fLevel = classifyLevel(feasibility);
  const iLevel = classifyLevel(impact);

  if (fLevel === 'Tinggi' && iLevel === 'Tinggi') return 'PRIORITAS UTAMA';
  if (fLevel === 'Rendah' && iLevel === 'Tinggi') return 'POTENSI';
  if (fLevel === 'Tinggi' && iLevel === 'Rendah') return 'PERTIMBANGKAN';
  return 'TUNDA';
}

/**
 * Enrich a raw idea object with derived quadrant fields.
 *
 * @param {Object} idea - Must have { feasibility, impact }
 * @param {number} originalIndex - Zero-based position in the seed array
 * @returns {Object} Idea with totalScore, feasibilityLevel, impactLevel, quadrant appended
 */
export function enrichIdea(idea, originalIndex) {
  const totalScore       = calculateTotal(idea.feasibility, idea.impact);
  const feasibilityLevel = classifyLevel(idea.feasibility);
  const impactLevel      = classifyLevel(idea.impact);
  const quadrant         = determineQuadrant(idea.feasibility, idea.impact);

  return {
    ...idea,
    totalScore,
    feasibilityLevel,
    impactLevel,
    quadrant,
    _originalIndex: originalIndex,
  };
}

/**
 * Identify the single selected priority idea from a list of (possibly enriched)
 * ideas, applying LKPD 6 selection rules:
 *
 *   1. Filter to PRIORITAS UTAMA quadrant only.
 *   2. Sort descending by totalScore.
 *   3. Tie-breaker: ascending by _originalIndex (lowest code # = primary HMW).
 *   4. Return the top result, or null if no PRIORITAS UTAMA ideas exist.
 *
 * @param {Object[]} ideas - Array of enriched idea objects
 * @returns {Object|null} The selected priority idea
 */
export function getSelectedPriorityIdea(ideas) {
  const priorityIdeas = ideas.filter((idea) => idea.quadrant === 'PRIORITAS UTAMA');

  if (priorityIdeas.length === 0) return null;

  const sorted = [...priorityIdeas].sort((a, b) => {
    // Primary sort: higher totalScore first
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    // Tie-breaker: lower original index first (aligns #1 as primary HMW for ONLASHOES)
    return (a._originalIndex ?? 0) - (b._originalIndex ?? 0);
  });

  return sorted[0];
}

/**
 * Returns all ideas in the PRIORITAS UTAMA quadrant, sorted descending by totalScore,
 * then ascending by _originalIndex.
 *
 * @param {Object[]} ideas
 * @returns {Object[]}
 */
export function getAllPriorityIdeas(ideas = []) {
  return ideas
    .filter((idea) => idea.quadrant === 'PRIORITAS UTAMA')
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return (a._originalIndex ?? 0) - (b._originalIndex ?? 0);
    });
}

/**
 * Convenience: enrich all ideas in an array and return them.
 *
 * @param {Object[]} rawIdeas - Seed or Firestore idea objects
 * @returns {Object[]} Fully enriched ideas
 */
export function enrichAll(rawIdeas) {
  return rawIdeas.map((idea, index) => enrichIdea(idea, index));
}

/**
 * Group an array of enriched ideas by quadrant.
 *
 * @param {Object[]} enrichedIdeas
 * @returns {Record<Quadrant, Object[]>}
 */
export function groupByQuadrant(enrichedIdeas) {
  return enrichedIdeas.reduce(
    (acc, idea) => {
      const q = idea.quadrant;
      if (!acc[q]) acc[q] = [];
      acc[q].push(idea);
      return acc;
    },
    {
      'PRIORITAS UTAMA': [],
      'POTENSI':         [],
      'PERTIMBANGKAN':   [],
      'TUNDA':           [],
    },
  );
}

/**
 * Visual & metadata tokens for each quadrant, synced with tailwind.config.js.
 */
export const QUADRANT_META = {
  'PRIORITAS UTAMA': {
    key: 'PRIORITAS_UTAMA',
    label: 'Prioritas Utama',
    subtitle: 'Keterlaksanaan Tinggi × Dampak Tinggi',
    action: 'Segera Realisasikan (Quick Win / Core Feature)',
    text: '#14532D',
    bg: '#ECFDF5',
    border: '#86EFAC',
    hex: '#059669',
    badgeClass: 'badge-q1',
  },
  'POTENSI': {
    key: 'POTENSI',
    label: 'Potensi',
    subtitle: 'Keterlaksanaan Rendah × Dampak Tinggi',
    action: 'Riset & Sederhanakan (Strategic Project)',
    text: '#1E3A8A',
    bg: '#EFF6FF',
    border: '#93C5FD',
    hex: '#2563EB',
    badgeClass: 'badge-q2',
  },
  'PERTIMBANGKAN': {
    key: 'PERTIMBANGKAN',
    label: 'Pertimbangkan',
    subtitle: 'Keterlaksanaan Tinggi × Dampak Rendah',
    action: 'Kerjakan Jika Ada Sisa Waktu (Low Hanging Fruit)',
    text: '#78350F',
    bg: '#FFFBEB',
    border: '#FCD34D',
    hex: '#D97706',
    badgeClass: 'badge-q3',
  },
  'TUNDA': {
    key: 'TUNDA',
    label: 'Tunda',
    subtitle: 'Keterlaksanaan Rendah × Dampak Rendah',
    action: 'Jangan Dikerjakan Sekarang (Money Pit / Drop)',
    text: '#334155',
    bg: '#F1F5F9',
    border: '#CBD5E1',
    hex: '#64748B',
    badgeClass: 'badge-q4',
  },
};



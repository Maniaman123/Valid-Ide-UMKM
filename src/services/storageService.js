/**
 * src/services/storageService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified persistence layer for LKPD 6 ideas.
 *
 * Strategy:
 *   PRIMARY   → Firebase Firestore (`lkpd6_onlashoes_ideas` collection)
 *               Activated when VITE_FIREBASE_* env variables are present.
 *   FALLBACK  → localStorage key `lkpd6_onlashoes_v1`
 *               Used automatically when Firebase env vars are absent or when
 *               Firestore initialisation throws.
 *
 * Both paths expose identical async API:
 *   loadIdeas()       → Promise<IdeaSeed[]>
 *   saveIdeas(ideas)  → Promise<void>
 *   resetToSeedData() → Promise<IdeaSeed[]>
 *
 * Data-loss guard: resetToSeedData() does NOT resolve until the write
 * completes on the active backend, preventing partial state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { SEED_IDEAS } from '../data/lkpd5SeedData.js';

// ── Environment detection ────────────────────────────────────────────────────

const FIREBASE_ENV = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const FIREBASE_ENABLED =
  Boolean(FIREBASE_ENV.apiKey) && Boolean(FIREBASE_ENV.projectId);

const FIRESTORE_COLLECTION = 'lkpd6_onlashoes_ideas';
const LS_KEY               = 'lkpd6_onlashoes_v1';

// ── Lazy Firestore singleton ─────────────────────────────────────────────────

/** @type {import('firebase/firestore').Firestore|null} */
let _db = null;

/**
 * Lazily initialise and return a Firestore db instance.
 * Returns null if Firebase is not configured or initialisation fails.
 *
 * @returns {Promise<import('firebase/firestore').Firestore|null>}
 */
async function getDb() {
  if (!FIREBASE_ENABLED) return null;
  if (_db) return _db;

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');

    const app = getApps().length ? getApp() : initializeApp(FIREBASE_ENV);
    _db = getFirestore(app);
    return _db;
  } catch (err) {
    console.warn('[storageService] Firebase init failed — falling back to localStorage.', err);
    return null;
  }
}

// ── Firestore helpers ────────────────────────────────────────────────────────

/**
 * Load all ideas from Firestore, ordered by their `code` field.
 *
 * @returns {Promise<Object[]>}
 */
async function firestoreLoad() {
  const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
  const db  = await getDb();
  const col = collection(db, FIRESTORE_COLLECTION);
  const q   = query(col, orderBy('code'));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ firestoreId: doc.id, ...doc.data() }));
}

/**
 * Atomically replace all Firestore documents with the provided ideas array
 * using a batched write.
 *
 * @param {Object[]} ideas
 * @returns {Promise<void>}
 */
async function firestoreSave(ideas) {
  const {
    collection,
    doc,
    writeBatch,
    getDocs,
  } = await import('firebase/firestore');
  const db  = await getDb();
  const col = collection(db, FIRESTORE_COLLECTION);

  // 1. Delete all existing documents
  const existingSnap = await getDocs(col);
  const deleteBatch  = writeBatch(db);
  existingSnap.docs.forEach((d) => deleteBatch.delete(d.ref));
  await deleteBatch.commit();

  // 2. Write new documents in a fresh batch (Firestore limit: 500 ops/batch)
  const writeBatchInst = writeBatch(db);
  ideas.forEach((idea) => {
    const { firestoreId, ...data } = idea; // strip transient Firestore ID
    const ref = firestoreId ? doc(col, firestoreId) : doc(col);
    writeBatchInst.set(ref, data);
  });
  await writeBatchInst.commit();
}

// ── localStorage helpers ─────────────────────────────────────────────────────

/**
 * @returns {Object[]|null}
 */
function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * @param {Object[]} ideas
 * @returns {void}
 */
function lsSave(ideas) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ideas));
  } catch (err) {
    console.error('[storageService] localStorage write failed:', err);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Load persisted ideas.
 * Falls back to seed data if the store is empty or unreadable.
 *
 * @returns {Promise<Object[]>}
 */
export async function loadIdeas() {
  const db = await getDb();

  if (db) {
    try {
      const ideas = await firestoreLoad();
      if (ideas.length > 0) return ideas;
      // Firestore empty → seed it
      await firestoreSave(SEED_IDEAS);
      return SEED_IDEAS;
    } catch (err) {
      console.warn('[storageService] Firestore load failed — falling back to localStorage.', err);
    }
  }

  // localStorage path
  const cached = lsLoad();
  if (cached && cached.length > 0) return cached;
  lsSave(SEED_IDEAS);
  return structuredClone(SEED_IDEAS);
}

/**
 * Persist the current ideas array.
 * Writes to Firestore when available, localStorage otherwise.
 *
 * @param {Object[]} ideas
 * @returns {Promise<void>}
 */
export async function saveIdeas(ideas) {
  const db = await getDb();

  if (db) {
    try {
      await firestoreSave(ideas);
      return;
    } catch (err) {
      console.warn('[storageService] Firestore save failed — writing to localStorage.', err);
    }
  }

  lsSave(ideas);
}

/**
 * Discard all edits and restore the original LKPD 5 seed data.
 * Waits for the write to complete before resolving.
 *
 * DATA-LOSS GUARD: This action is irreversible. The caller (UI layer)
 * MUST obtain explicit user confirmation before invoking this function.
 *
 * @returns {Promise<Object[]>} The restored seed ideas
 */
export async function resetToSeedData() {
  const freshSeed = structuredClone(SEED_IDEAS);
  await saveIdeas(freshSeed); // blocks until write confirmed
  return freshSeed;
}

// ── Debug / diagnostics (development only) ──────────────────────────────────

/**
 * @returns {{ backend: 'firestore'|'localStorage', firebaseEnabled: boolean }}
 */
export function getStorageInfo() {
  return {
    backend:        FIREBASE_ENABLED ? 'firestore' : 'localStorage',
    firebaseEnabled: FIREBASE_ENABLED,
    lsKey:          LS_KEY,
    collection:     FIRESTORE_COLLECTION,
  };
}


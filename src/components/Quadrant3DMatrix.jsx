import React, { useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { QUADRANT_META } from '../utils/quadrantLogic';

// ─── Constants ────────────────────────────────────────────────────────────────

const AXIS_MIN = 1;
const AXIS_MAX = 5;
const DIVIDE   = 3.5;   // threshold in data-space
const SCALE    = 1.4;   // data-unit → 3D unit
const Y_SCALE  = 0.28;  // total score → 3D height (score 10 → 2.8 units)
const FLOOR_Y  = 0;

// Map data value (1–5) to 3D position on a given axis.
const toPos = (v) => (v - 1) * SCALE - ((AXIS_MAX - AXIS_MIN) / 2) * SCALE; // centred at 0

// Quadrant floor tile definition (centred rects on XZ plane)
const TILES = [
  {
    id: 'PRIORITAS UTAMA',
    xMin: DIVIDE, xMax: 5, zMin: DIVIDE, zMax: 5,
    color: '#ECFDF5', border: '#059669',
  },
  {
    id: 'POTENSI',
    xMin: 1, xMax: DIVIDE, zMin: DIVIDE, zMax: 5,
    color: '#EFF6FF', border: '#2563EB',
  },
  {
    id: 'PERTIMBANGKAN',
    xMin: DIVIDE, xMax: 5, zMin: 1, zMax: DIVIDE,
    color: '#FFFBEB', border: '#D97706',
  },
  {
    id: 'TUNDA',
    xMin: 1, xMax: DIVIDE, zMin: 1, zMax: DIVIDE,
    color: '#F1F5F9', border: '#64748B',
  },
];

// Deterministic radial offset for stacked nodes
function getOffsets(group) {
  const n = group.length;
  if (n === 1) return [[0, 0]];
  return group.map((_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return [Math.cos(angle) * 0.22, Math.sin(angle) * 0.22];
  });
}

// ─── Quadrant floor tiles ─────────────────────────────────────────────────────

function QuadrantFloor() {
  return (
    <group position={[0, FLOOR_Y - 0.001, 0]}>
      {TILES.map((tile) => {
        const cx = toPos((tile.xMin + tile.xMax) / 2);
        const cz = toPos((tile.zMin + tile.zMax) / 2);
        const w  = (tile.xMax - tile.xMin) * SCALE;
        const d  = (tile.zMax - tile.zMin) * SCALE;
        return (
          <group key={tile.id} position={[cx, 0, cz]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w - 0.04, d - 0.04]} />
              <meshStandardMaterial color={tile.color} roughness={1} metalness={0} />
            </mesh>
            {/* Border frame via 4 thin edge strips */}
            {[
              [0, -(d / 2), w, 0.025],
              [0,  (d / 2), w, 0.025],
              [-(w / 2), 0, 0.025, d],
              [ (w / 2), 0, 0.025, d],
            ].map(([ex, ez, ew, ed], i) => (
              <mesh key={i} position={[ex, 0.001, ez]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[ew, ed]} />
                <meshStandardMaterial color={tile.border} roughness={1} metalness={0} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// ─── Divider walls ────────────────────────────────────────────────────────────

function DividerWalls() {
  const wallHeight = 1.0;
  const fullLen    = (AXIS_MAX - AXIS_MIN) * SCALE + 0.01;
  const divX       = toPos(DIVIDE);
  const divZ       = toPos(DIVIDE);

  return (
    <group>
      {/* Vertical X divider (runs along Z) */}
      <mesh position={[divX, wallHeight / 2, 0]}>
        <boxGeometry args={[0.012, wallHeight, fullLen]} />
        <meshStandardMaterial color="#171615" transparent opacity={0.08} roughness={1} />
      </mesh>
      {/* Vertical Z divider (runs along X) */}
      <mesh position={[0, wallHeight / 2, divZ]}>
        <boxGeometry args={[fullLen, wallHeight, 0.012]} />
        <meshStandardMaterial color="#171615" transparent opacity={0.08} roughness={1} />
      </mesh>
    </group>
  );
}

// ─── Axis grid & labels ───────────────────────────────────────────────────────

function AxisGrid() {
  const halfLen = ((AXIS_MAX - AXIS_MIN) / 2) * SCALE;
  const ticks   = [1, 2, 3, 4, 5];

  return (
    <group>
      {/* X axis line */}
      <mesh position={[0, FLOOR_Y, -halfLen - 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, (AXIS_MAX - AXIS_MIN) * SCALE + 0.6, 8]} />
        <meshStandardMaterial color="#6B655E" roughness={1} />
      </mesh>
      {/* Z axis line */}
      <mesh position={[-halfLen - 0.3, FLOOR_Y, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, (AXIS_MAX - AXIS_MIN) * SCALE + 0.6, 8]} />
        <meshStandardMaterial color="#6B655E" roughness={1} />
      </mesh>

      {/* X tick marks */}
      {ticks.map((v) => (
        <group key={`xt-${v}`} position={[toPos(v), FLOOR_Y, -halfLen - 0.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
            <meshStandardMaterial color="#8C827A" roughness={1} />
          </mesh>
          <Html center distanceFactor={6} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '9px',
              fontWeight: '600',
              color: '#F1F5F9',
              whiteSpace: 'nowrap',
            }}>{v}</span>
          </Html>
        </group>
      ))}

      {/* Z tick marks */}
      {ticks.map((v) => (
        <group key={`zt-${v}`} position={[-halfLen - 0.3, FLOOR_Y, toPos(v)]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
            <meshStandardMaterial color="#8C827A" roughness={1} />
          </mesh>
          <Html center distanceFactor={6} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '9px',
              fontWeight: '600',
              color: '#F1F5F9',
              whiteSpace: 'nowrap',
            }}>{v}</span>
          </Html>
        </group>
      ))}

      {/* Axis labels */}
      <Html position={[0, FLOOR_Y, -halfLen - 1.05]} center distanceFactor={5} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '10px',
          fontWeight: '700',
          color: '#FFFFFF',
          backgroundColor: '#059669',
          border: '1px solid #86EFAC',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.5,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}>
          FEASIBILITY (1–5)
        </div>
      </Html>

      <Html position={[-halfLen - 1.15, FLOOR_Y, 0]} center distanceFactor={5} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '10px',
          fontWeight: '700',
          color: '#FFFFFF',
          backgroundColor: '#2563EB',
          border: '1px solid #93C5FD',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.5,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}>
          IMPACT (1–5)
        </div>
      </Html>

      {/* Quadrant zone labels */}
      {[
        { id: 'PRIORITAS UTAMA', x: 4.25, z: 4.25, color: '#059669' },
        { id: 'POTENSI',         x: 2.0,  z: 4.25, color: '#2563EB' },
        { id: 'PERTIMBANGKAN',   x: 4.25, z: 2.0,  color: '#D97706' },
        { id: 'TUNDA',           x: 2.0,  z: 2.0,  color: '#64748B' },
      ].map(({ id, x, z, color }) => (
        <Html
          key={id}
          position={[toPos(x), FLOOR_Y + 0.04, toPos(z)]}
          center
          distanceFactor={7}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '8px',
            fontWeight: '700',
            color,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            opacity: 0.9,
          }}>{id}</span>
        </Html>
      ))}

      {/* Y axis title at top */}
      <Html position={[halfLen + 0.6, 2.9, 0]} center distanceFactor={6} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '8px',
          fontWeight: '700',
          color: '#C85A32',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}>TOTAL SKOR ↑</span>
      </Html>
    </group>
  );
}

// ─── Single idea node ─────────────────────────────────────────────────────────

function IdeaNode({ idea, offsetX, offsetZ, isSelected, isHovered, onClick, onPointerOver, onPointerOut }) {
  const stemRef  = useRef();
  const headRef  = useRef();

  const x       = toPos(idea.feasibility) + offsetX;
  const z       = toPos(idea.impact)      + offsetZ;
  const height  = idea.totalScore * Y_SCALE;
  const stemH   = Math.max(height - 0.18, 0.1);

  const meta       = QUADRANT_META[idea.quadrant];
  const baseColor  = meta?.hex ?? '#64748B';
  const activeColor = '#C85A32';
  const color      = isSelected || isHovered ? activeColor : baseColor;

  // Subtle float animation for selected node
  useFrame((state) => {
    if (!headRef.current) return;
    if (isSelected || isHovered) {
      headRef.current.position.y = height + Math.sin(state.clock.elapsedTime * 2.5) * 0.06;
    } else {
      headRef.current.position.y = height;
    }
  });

  return (
    <group
      position={[x, FLOOR_Y, z]}
      onClick={(e) => { e.stopPropagation(); onClick(idea); }}
      onPointerOver={(e) => { e.stopPropagation(); onPointerOver(idea); }}
      onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
    >
      {/* Vertical stem */}
      <mesh ref={stemRef} position={[0, stemH / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.035, stemH, 10]} />
        <meshStandardMaterial color={isSelected || isHovered ? '#C85A32' : '#B5AEA4'} roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Contact shadow circle on floor */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 24]} />
        <meshStandardMaterial color="#171615" transparent opacity={0.08} roughness={1} />
      </mesh>

      {/* Head: octahedron for PRIORITAS UTAMA, sphere otherwise */}
      <group ref={headRef} position={[0, height, 0]}>
        {idea.quadrant === 'PRIORITAS UTAMA' ? (
          <mesh>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
          </mesh>
        ) : idea.quadrant === 'POTENSI' ? (
          <mesh>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
          </mesh>
        ) : idea.quadrant === 'PERTIMBANGKAN' ? (
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.18, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
          </mesh>
        ) : (
          <mesh>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
          </mesh>
        )}
      </group>

      {/* Code tag pin above head */}
      <Html
        position={[0, height + 0.38, 0]}
        center
        distanceFactor={5}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: isSelected || isHovered ? '11px' : '9px',
          fontWeight: '700',
          color: isSelected || isHovered ? '#C85A32' : '#171615',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${isSelected || isHovered ? '#C85A32' : '#E2DDD5'}`,
          padding: '1px 5px',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          lineHeight: 1.5,
        }}>
          {idea.code}
        </div>
      </Html>
    </group>
  );
}

// ─── Camera preset controller ─────────────────────────────────────────────────

function CameraController({ preset }) {
  const { camera } = useThree();
  const targetRef   = useRef(new THREE.Vector3(0, 0, 0));

  const presets = {
    iso:  [4.5, 4.5, 5.5],
    top:  [0,   8,   0.01],
    side: [7,   2,   0],
  };

  const [animating, setAnimating] = useState(false);
  const targetPos   = useRef(new THREE.Vector3(...(presets[preset] ?? presets.iso)));

  React.useEffect(() => {
    const p = presets[preset] ?? presets.iso;
    targetPos.current.set(...p);
    setAnimating(true);
  }, [preset]);

  useFrame(() => {
    if (!animating) return;
    camera.position.lerp(targetPos.current, 0.07);
    camera.lookAt(0, 0.5, 0);
    if (camera.position.distanceTo(targetPos.current) < 0.05) setAnimating(false);
  });

  return null;
}

// ─── Inspection card overlay ──────────────────────────────────────────────────

function InspectionCard({ idea }) {
  if (!idea) return null;
  const meta = QUADRANT_META[idea.quadrant];

  return (
    <div
      className="absolute top-3 right-3 bg-surface border border-border p-3 w-56 z-10 pointer-events-none"
      aria-live="polite"
    >
      <div className="border-b border-border pb-2 mb-2">
        <span className="font-mono text-3xs uppercase tracking-widest text-brand font-semibold block">
          INSPEKSI NODE
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-mono text-xs font-bold text-ink">{idea.code}</span>
        </div>
        <p className="text-xs text-ink font-medium leading-snug mt-0.5 line-clamp-2">
          {idea.title}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1 font-mono text-2xs mb-2">
        <div className="bg-sand border border-border px-1 py-1 text-center">
          <span className="text-muted block" style={{ fontSize: '7px' }}>FEASIB.</span>
          <span className="font-bold text-ink">{idea.feasibility}</span>
        </div>
        <div className="bg-sand border border-border px-1 py-1 text-center">
          <span className="text-muted block" style={{ fontSize: '7px' }}>IMPACT</span>
          <span className="font-bold text-ink">{idea.impact}</span>
        </div>
        <div className="bg-sand border border-border px-1 py-1 text-center">
          <span className="text-muted block" style={{ fontSize: '7px' }}>TOTAL</span>
          <span className="font-bold text-ink">{idea.totalScore}</span>
        </div>
      </div>
      {meta && (
        <span
          className={`inline-flex px-2 py-0.5 text-3xs font-mono font-bold uppercase tracking-wider ${meta.badgeClass}`}
        >
          {idea.quadrant}
        </span>
      )}
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export default function Quadrant3DMatrix({ enrichedIdeas = [], selectedIdeaId, onSelectIdea }) {
  const [hoveredIdea, setHoveredIdea]   = useState(null);
  const [cameraPreset, setCameraPreset] = useState('iso');

  // Group by identical (feasibility, impact) → compute offsets
  const nodesWithOffsets = useMemo(() => {
    const groups = {};
    enrichedIdeas.forEach((idea) => {
      const key = `${idea.feasibility}-${idea.impact}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(idea);
    });

    const result = [];
    Object.values(groups).forEach((group) => {
      const offsets = getOffsets(group);
      group.forEach((idea, i) => {
        result.push({ idea, offsetX: offsets[i][0], offsetZ: offsets[i][1] });
      });
    });
    return result;
  }, [enrichedIdeas]);

  const handleSelect    = useCallback((idea) => { onSelectIdea?.(idea.id); }, [onSelectIdea]);
  const handleHoverIn   = useCallback((idea) => { setHoveredIdea(idea); },   []);
  const handleHoverOut  = useCallback(() => { setHoveredIdea(null); },        []);

  const inspectionIdea = hoveredIdea
    ?? enrichedIdeas.find((i) => i.id === selectedIdeaId)
    ?? null;

  const VIEW_PRESETS = [
    { key: 'iso',  label: '3D Isometrik' },
    { key: 'top',  label: 'Tampak Atas' },
    { key: 'side', label: 'Tampak Samping' },
  ];

  return (
    <section aria-label="Matriks 3D Kuadran LKPD 6" className="surface-card mb-6 overflow-hidden relative z-0 isolate">
      {/* Card header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3.5 border-b border-border print-hide">
        <div>
          <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
            MATRIKS PRIORITAS 3D — LKPD 6
          </span>
          <h3 className="text-sm font-bold text-ink">
            Visualisasi Kuadran Keterlaksanaan × Dampak × Total Skor
          </h3>
        </div>

        {/* Camera preset toolbar */}
        <div className="flex items-center gap-1.5" role="group" aria-label="Preset Kamera">
          {VIEW_PRESETS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCameraPreset(key)}
              className={`min-h-[32px] px-3 py-1 text-2xs font-mono uppercase tracking-wide border transition-colors ${
                cameraPreset === key
                  ? 'bg-ink text-surface border-ink'
                  : 'bg-surface text-ink border-border hover:bg-sand'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full isolate z-0" style={{ height: '520px' }}>
        <Canvas
          camera={{ position: [4.5, 4.5, 5.5], fov: 42 }}
          style={{ background: '#F7F5F0' }}
          shadows={false}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          {/* Studio lighting */}
          <ambientLight intensity={0.65} color="#ffffff" />
          <directionalLight
            position={[6, 10, 6]}
            intensity={1.1}
            color="#fff8f0"
          />
          <directionalLight
            position={[-4, 4, -4]}
            intensity={0.3}
            color="#f0f4ff"
          />

          <Suspense fallback={null}>
            <QuadrantFloor />
            <DividerWalls />
            <AxisGrid />

            {nodesWithOffsets.map(({ idea, offsetX, offsetZ }) => (
              <IdeaNode
                key={idea.id ?? idea.code}
                idea={idea}
                offsetX={offsetX}
                offsetZ={offsetZ}
                isSelected={idea.id === selectedIdeaId}
                isHovered={hoveredIdea?.id === idea.id || hoveredIdea?.code === idea.code}
                onClick={handleSelect}
                onPointerOver={handleHoverIn}
                onPointerOut={handleHoverOut}
              />
            ))}
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2.15}
            minDistance={3}
            maxDistance={14}
            enablePan={true}
          />
          <CameraController preset={cameraPreset} />
        </Canvas>

        {/* Inspection overlay card */}
        <InspectionCard idea={inspectionIdea} />

        {/* Legend strip */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 print-hide">
          {[
            { label: 'Prioritas Utama', color: '#059669', shape: '◆' },
            { label: 'Potensi',         color: '#2563EB', shape: '●' },
            { label: 'Pertimbangkan',   color: '#D97706', shape: '▬' },
            { label: 'Tunda',           color: '#64748B', shape: '■' },
          ].map(({ label, color, shape }) => (
            <div
              key={label}
              className="flex items-center gap-1 bg-surface/90 border border-border px-2 py-0.5"
            >
              <span style={{ color, fontSize: '10px' }}>{shape}</span>
              <span className="font-mono text-3xs text-ink uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


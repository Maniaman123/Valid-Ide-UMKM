import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { QUADRANT_META } from "../utils/quadrantLogic";

// ─── Constants ────────────────────────────────────────────────────────────────

const AXIS_MIN = 1;
const AXIS_MAX = 5;
const DIVIDE = 3.5;
const SCALE = 1.4; // data-unit → 3D unit
const Y_SCALE = 0.28; // total score → 3D height (10 → 2.8)
const FLOOR_Y = 0;

// Board centred at [0,0,0]. toPos(1)=-2.8, toPos(3)=0, toPos(5)=2.8
const toPos = (v) => (v - 1) * SCALE - ((AXIS_MAX - AXIS_MIN) / 2) * SCALE;

// Centered full-board isometric camera framing for both default view & PDF print snapshot
const PRINT_CAM_POS = [6.8, 7.6, 6.8];
const PRINT_CAM_TARGET = [0, 1.2, 0];

// ─── Tiles ───────────────────────────────────────────────────────────────────

const TILES = [
  {
    id: "PRIORITAS UTAMA",
    xMin: DIVIDE,
    xMax: 5,
    zMin: DIVIDE,
    zMax: 5,
    color: "#ECFDF5",
    border: "#059669",
  },
  {
    id: "POTENSI",
    xMin: 1,
    xMax: DIVIDE,
    zMin: DIVIDE,
    zMax: 5,
    color: "#EFF6FF",
    border: "#2563EB",
  },
  {
    id: "PERTIMBANGKAN",
    xMin: DIVIDE,
    xMax: 5,
    zMin: 1,
    zMax: DIVIDE,
    color: "#FFFBEB",
    border: "#D97706",
  },
  {
    id: "TUNDA",
    xMin: 1,
    xMax: DIVIDE,
    zMin: 1,
    zMax: DIVIDE,
    color: "#F1F5F9",
    border: "#64748B",
  },
];

function getOffsets(group) {
  const n = group.length;
  if (n === 1) return [[0, 0]];
  return group.map((_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return [Math.cos(angle) * 0.22, Math.sin(angle) * 0.22];
  });
}

// ─── Reusable WebGL Badge Label (Billboard + Backing Plane + Text) ───────────

function WebGLBadge({
  position,
  text,
  width = 1.6,
  height = 0.28,
  bgColor = "#FFFFFF",
  borderColor = "#E2DDD5",
  textColor = "#171615",
  fontSize = 0.13,
  fontWeight = "bold",
}) {
  return (
    <Billboard position={position} follow>
      {/* Border backing plane */}
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[width + 0.035, height + 0.035]} />
        <meshBasicMaterial color={borderColor} />
      </mesh>
      {/* Inner fill plane */}
      <mesh position={[0, 0, -0.004]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={bgColor} />
      </mesh>
      {/* Crisp WebGL Text */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </Billboard>
  );
}

// ─── Quadrant floor tiles ─────────────────────────────────────────────────────

function QuadrantFloor() {
  return (
    <group position={[0, FLOOR_Y - 0.001, 0]}>
      {TILES.map((tile) => {
        const cx = toPos((tile.xMin + tile.xMax) / 2);
        const cz = toPos((tile.zMin + tile.zMax) / 2);
        const w = (tile.xMax - tile.xMin) * SCALE;
        const d = (tile.zMax - tile.zMin) * SCALE;
        return (
          <group key={tile.id} position={[cx, 0, cz]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w - 0.04, d - 0.04]} />
              <meshStandardMaterial
                color={tile.color}
                roughness={1}
                metalness={0}
              />
            </mesh>
            {[
              [0, -(d / 2), w, 0.025],
              [0, d / 2, w, 0.025],
              [-(w / 2), 0, 0.025, d],
              [w / 2, 0, 0.025, d],
            ].map(([ex, ez, ew, ed], i) => (
              <mesh
                key={i}
                position={[ex, 0.001, ez]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[ew, ed]} />
                <meshStandardMaterial
                  color={tile.border}
                  roughness={1}
                  metalness={0}
                />
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
  const fullLen = (AXIS_MAX - AXIS_MIN) * SCALE + 0.01;
  const divX = toPos(DIVIDE);
  const divZ = toPos(DIVIDE);
  return (
    <group>
      <mesh position={[divX, wallHeight / 2, 0]}>
        <boxGeometry args={[0.012, wallHeight, fullLen]} />
        <meshStandardMaterial
          color="#171615"
          transparent
          opacity={0.08}
          roughness={1}
        />
      </mesh>
      <mesh position={[0, wallHeight / 2, divZ]}>
        <boxGeometry args={[fullLen, wallHeight, 0.012]} />
        <meshStandardMaterial
          color="#171615"
          transparent
          opacity={0.08}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

// ─── Axis grid & native WebGL labels ──────────────────────────────────────────

function AxisGrid() {
  const halfLen = ((AXIS_MAX - AXIS_MIN) / 2) * SCALE;
  const ticks = [1, 2, 3, 4, 5];

  return (
    <group>
      {/* X axis rod */}
      <mesh
        position={[0, FLOOR_Y, -halfLen - 0.3]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry
          args={[0.008, 0.008, (AXIS_MAX - AXIS_MIN) * SCALE + 0.6, 8]}
        />
        <meshStandardMaterial color="#171615" roughness={1} />
      </mesh>
      {/* Z axis rod */}
      <mesh position={[-halfLen - 0.3, FLOOR_Y, 0]}>
        <cylinderGeometry
          args={[0.008, 0.008, (AXIS_MAX - AXIS_MIN) * SCALE + 0.6, 8]}
        />
        <meshStandardMaterial color="#171615" roughness={1} />
      </mesh>

      {/* X tick marks + native WebGL labels */}
      {ticks.map((v) => (
        <group key={`xt-${v}`} position={[toPos(v), FLOOR_Y, -halfLen - 0.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
            <meshStandardMaterial color="#171615" roughness={1} />
          </mesh>
          <Billboard position={[0, 0.14, -0.22]} follow>
            <Text
              fontSize={0.14}
              fontWeight="bold"
              color="#171615"
              anchorX="center"
              anchorY="middle"
            >
              {String(v)}
            </Text>
          </Billboard>
        </group>
      ))}

      {/* Z tick marks + native WebGL labels */}
      {ticks.map((v) => (
        <group key={`zt-${v}`} position={[-halfLen - 0.3, FLOOR_Y, toPos(v)]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
            <meshStandardMaterial color="#171615" roughness={1} />
          </mesh>
          <Billboard position={[-0.22, 0.14, 0]} follow>
            <Text
              fontSize={0.14}
              fontWeight="bold"
              color="#171615"
              anchorX="center"
              anchorY="middle"
            >
              {String(v)}
            </Text>
          </Billboard>
        </group>
      ))}

      {/* FEASIBILITY axis badge */}
      <WebGLBadge
        position={[0, FLOOR_Y + 0.18, -halfLen - 0.95]}
        text="FEASIBILITY (1–5)"
        width={1.85}
        height={0.3}
        bgColor="#059669"
        borderColor="#86EFAC"
        textColor="#FFFFFF"
        fontSize={0.13}
      />

      {/* IMPACT axis badge */}
      <WebGLBadge
        position={[-halfLen - 1.05, FLOOR_Y + 0.18, 0]}
        text="IMPACT (1–5)"
        width={1.45}
        height={0.3}
        bgColor="#2563EB"
        borderColor="#93C5FD"
        textColor="#FFFFFF"
        fontSize={0.13}
      />

      {/* Quadrant zone labels */}
      {[
        { id: "PRIORITAS UTAMA", x: 4.25, z: 4.25, color: "#059669" },
        { id: "POTENSI", x: 2.0, z: 4.25, color: "#2563EB" },
        { id: "PERTIMBANGKAN", x: 4.25, z: 2.0, color: "#D97706" },
        { id: "TUNDA", x: 2.0, z: 2.0, color: "#64748B" },
      ].map(({ id, x, z, color }) => (
        <Billboard key={id} position={[toPos(x), FLOOR_Y + 0.08, toPos(z)]} follow>
          <Text
            fontSize={0.14}
            fontWeight="bold"
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            {id}
          </Text>
        </Billboard>
      ))}

      {/* ─── Y-Axis Ruler: Total Score (2–10) ─────────────────────────── */}
      <mesh position={[-halfLen - 0.3, 1.5, -halfLen - 0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 3.0, 10]} />
        <meshStandardMaterial color="#C85A32" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Reference lines at score 5 & 10 */}
      {[5, 10].map((s) => (
        <group key={`elev-${s}`} position={[0, s * Y_SCALE, 0]}>
          <mesh
            position={[0, 0, -halfLen - 0.3]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry
              args={[0.004, 0.004, (AXIS_MAX - AXIS_MIN) * SCALE + 0.6, 6]}
            />
            <meshStandardMaterial
              color={s === 10 ? "#C85A32" : "#B5AEA4"}
              transparent
              opacity={0.22}
              roughness={1}
            />
          </mesh>
          <mesh position={[-halfLen - 0.3, 0, 0]}>
            <cylinderGeometry
              args={[0.004, 0.004, (AXIS_MAX - AXIS_MIN) * SCALE + 0.6, 6]}
            />
            <meshStandardMaterial
              color={s === 10 ? "#C85A32" : "#B5AEA4"}
              transparent
              opacity={0.22}
              roughness={1}
            />
          </mesh>
        </group>
      ))}

      {/* Y score ticks & WebGL numbers (2–10) */}
      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
        const y = score * Y_SCALE;
        const isMax = score === 10;
        const isEven = score % 2 === 0;
        return (
          <group
            key={`yt-${score}`}
            position={[-halfLen - 0.3, y, -halfLen - 0.3]}
          >
            <mesh position={[0.05, 0, 0.05]} rotation={[0, -Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
              <meshStandardMaterial
                color={isMax ? "#C85A32" : isEven ? "#E2DDD5" : "#B5AEA4"}
                roughness={1}
              />
            </mesh>
            {isMax ? (
              <WebGLBadge
                position={[-0.24, 0, -0.24]}
                text="10"
                width={0.32}
                height={0.22}
                bgColor="#FDF3EE"
                borderColor="#C85A32"
                textColor="#C85A32"
                fontSize={0.13}
              />
            ) : (
              <Billboard position={[-0.22, 0, -0.22]} follow>
                <Text
                  fontSize={isEven ? 0.12 : 0.10}
                  fontWeight={isEven ? "bold" : "normal"}
                  color={isEven ? "#171615" : "#6B655E"}
                  anchorX="center"
                  anchorY="middle"
                >
                  {String(score)}
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}

      {/* Y axis title badge */}
      <WebGLBadge
        position={[-halfLen - 0.3, 10 * Y_SCALE + 0.42, -halfLen - 0.3]}
        text="TOTAL SKOR (2–10)"
        width={1.85}
        height={0.3}
        bgColor="#C85A32"
        borderColor="#FDBA74"
        textColor="#FFFFFF"
        fontSize={0.13}
      />
    </group>
  );
}

// ─── Single idea node ─────────────────────────────────────────────────────────

function IdeaNode({
  idea,
  offsetX,
  offsetZ,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  const headRef = useRef();

  const x = toPos(idea.feasibility) + offsetX;
  const z = toPos(idea.impact) + offsetZ;
  const height = idea.totalScore * Y_SCALE;
  const stemH = Math.max(height - 0.18, 0.1);

  const meta = QUADRANT_META[idea.quadrant];
  const baseColor = meta?.hex ?? "#64748B";
  const active = isSelected || isHovered;
  const color = active ? "#C85A32" : baseColor;

  useFrame((state) => {
    if (!headRef.current) return;
    if (active) {
      headRef.current.position.y =
        height + Math.sin(state.clock.elapsedTime * 2.5) * 0.06;
    } else {
      headRef.current.position.y = height;
    }
  });

  const codeLabel = String(idea.code ?? "");
  const badgeW = Math.max(0.36, codeLabel.length * 0.11 + 0.14);

  return (
    <group
      position={[x, FLOOR_Y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(idea);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver(idea);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut();
      }}
    >
      {/* Stem */}
      <mesh position={[0, stemH / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.035, stemH, 10]} />
        <meshStandardMaterial
          color={active ? "#C85A32" : "#B5AEA4"}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Contact shadow */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 24]} />
        <meshStandardMaterial
          color="#171615"
          transparent
          opacity={0.07}
          roughness={1}
        />
      </mesh>

      {/* Head geometry */}
      <group ref={headRef} position={[0, height, 0]}>
        {idea.quadrant === "PRIORITAS UTAMA" ? (
          <mesh>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial
              color={color}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        ) : idea.quadrant === "POTENSI" ? (
          <mesh>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial
              color={color}
              roughness={0.5}
              metalness={0.05}
            />
          </mesh>
        ) : idea.quadrant === "PERTIMBANGKAN" ? (
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.18, 8]} />
            <meshStandardMaterial
              color={color}
              roughness={0.6}
              metalness={0.05}
            />
          </mesh>
        ) : (
          <mesh>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
          </mesh>
        )}
      </group>

      {/* Native WebGL Billboard Code Pin */}
      <WebGLBadge
        position={[0, height + 0.36, 0]}
        text={codeLabel}
        width={badgeW}
        height={0.22}
        bgColor="#FFFFFF"
        borderColor={active ? "#C85A32" : "#E2DDD5"}
        textColor={active ? "#C85A32" : "#171615"}
        fontSize={active ? 0.13 : 0.11}
      />
    </group>
  );
}

// ─── Camera Controller & Print Snapshot Bridge ────────────────────────────────

const _camAnimating = { current: false };

function CameraController({ orbitRef, onBridgeReady }) {
  const { camera, gl, scene } = useThree();
  const targetPos = useRef(new THREE.Vector3(...PRINT_CAM_POS));
  const targetLook = useRef(new THREE.Vector3(...PRINT_CAM_TARGET));

  // Initial fly-in on mount
  useEffect(() => {
    camera.position.set(PRINT_CAM_POS[0], 12, PRINT_CAM_POS[2]);
    _camAnimating.current = true;
  }, [camera]);

  useFrame(() => {
    if (!_camAnimating.current) return;
    camera.position.lerp(targetPos.current, 0.08);
    if (orbitRef.current) {
      orbitRef.current.target.lerp(targetLook.current, 0.08);
      orbitRef.current.update();
    } else {
      camera.lookAt(targetLook.current);
    }
    if (camera.position.distanceTo(targetPos.current) < 0.03) {
      camera.position.copy(targetPos.current);
      if (orbitRef.current) {
        orbitRef.current.target.copy(targetLook.current);
        orbitRef.current.update();
      }
      _camAnimating.current = false;
    }
  });

  // Expose synchronous + frame-synced snapshot function
  useEffect(() => {
    const capture = async ({ syncOnly = false } = {}) => {
      const prevPos = camera.position.clone();
      const prevTarget = orbitRef.current
        ? orbitRef.current.target.clone()
        : new THREE.Vector3(...PRINT_CAM_TARGET);
      const prevAnimating = _camAnimating.current;

      _camAnimating.current = false;
      camera.position.set(...PRINT_CAM_POS);
      if (orbitRef.current) {
        orbitRef.current.target.set(...PRINT_CAM_TARGET);
        orbitRef.current.update();
      } else {
        camera.lookAt(...PRINT_CAM_TARGET);
      }
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      if (!syncOnly) {
        // Wait 2 animation frames so Billboard quaternions orient to PRINT_CAM_POS
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      }

      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");

      // Restore interactive user camera state
      camera.position.copy(prevPos);
      if (orbitRef.current) {
        orbitRef.current.target.copy(prevTarget);
        orbitRef.current.update();
      }
      _camAnimating.current = prevAnimating;
      gl.render(scene, camera);

      return dataUrl;
    };

    onBridgeReady?.(capture);
  }, [camera, gl, scene, orbitRef, onBridgeReady]);

  return null;
}

// ─── Inspection card overlay ──────────────────────────────────────────────────

function InspectionCard({ idea }) {
  if (!idea) return null;
  const meta = QUADRANT_META[idea.quadrant];
  return (
    <div
      className="absolute top-3 right-3 bg-surface border border-border p-3 w-60 z-10 pointer-events-none"
      aria-live="polite"
    >
      <div className="border-b border-border pb-2 mb-2">
        <span className="font-mono text-3xs uppercase tracking-widest text-brand font-semibold block">
          INSPEKSI NODE
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-mono text-xs font-bold text-ink">
            {idea.code}
          </span>
          {idea.scamper && (
            <span className="font-mono text-3xs px-1 border border-border bg-sand text-ink font-semibold">
              SCAMPER: {idea.scamper}
            </span>
          )}
        </div>
        <p className="text-xs text-ink font-semibold leading-snug mt-0.5 line-clamp-2">
          {idea.title}
        </p>
        {(idea.description || idea.justification) && (
          <p className="text-3xs text-muted leading-tight mt-1 line-clamp-3">
            {idea.description || idea.justification}
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1 font-mono text-2xs mb-2">
        {[
          ["FEASIB.", idea.feasibility],
          ["IMPACT", idea.impact],
          ["TOTAL", idea.totalScore],
        ].map(([lbl, val]) => (
          <div
            key={lbl}
            className="bg-sand border border-border px-1 py-1 text-center"
          >
            <span className="text-muted block" style={{ fontSize: "7px" }}>
              {lbl}
            </span>
            <span className="font-bold text-ink">{val}</span>
          </div>
        ))}
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

const Quadrant3DMatrix = forwardRef(function Quadrant3DMatrix(
  { enrichedIdeas = [], selectedIdeaId, onSelectIdea },
  ref,
) {
  const [hoveredIdea, setHoveredIdea] = useState(null);
  const [matrixPrintImg, setMatrixPrintImg] = useState(null);
  const orbitRef = useRef();
  const captureFnRef = useRef(null);

  const handleBridgeReady = useCallback((fn) => {
    captureFnRef.current = fn;
  }, []);

  const capturePrintSnapshot = useCallback(async (opts = {}) => {
    if (!captureFnRef.current) return null;
    try {
      const dataUrl = await captureFnRef.current(opts);
      if (dataUrl) {
        setMatrixPrintImg(dataUrl);
      }
      return dataUrl;
    } catch {
      return null;
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      capturePrintSnapshot,
    }),
    [capturePrintSnapshot],
  );

  // Sync print snapshot on Ctrl+P (beforeprint)
  useEffect(() => {
    const onBeforePrint = () => {
      capturePrintSnapshot({ syncOnly: true });
    };
    window.addEventListener("beforeprint", onBeforePrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
    };
  }, [capturePrintSnapshot]);

  // Keep a warm fallback snapshot ready whenever ideas/selection updates
  useEffect(() => {
    const timer = setTimeout(() => {
      capturePrintSnapshot();
    }, 650);
    return () => clearTimeout(timer);
  }, [enrichedIdeas, selectedIdeaId, capturePrintSnapshot]);

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
      group.forEach((idea, i) =>
        result.push({ idea, offsetX: offsets[i][0], offsetZ: offsets[i][1] }),
      );
    });
    return result;
  }, [enrichedIdeas]);

  const handleSelect = useCallback(
    (idea) => {
      onSelectIdea?.(idea.id);
    },
    [onSelectIdea],
  );
  const handleHoverIn = useCallback((idea) => {
    setHoveredIdea(idea);
  }, []);
  const handleHoverOut = useCallback(() => {
    setHoveredIdea(null);
  }, []);

  const inspectionIdea =
    hoveredIdea ?? enrichedIdeas.find((i) => i.id === selectedIdeaId) ?? null;

  const LEGEND_ITEMS = [
    { label: "Prioritas Utama", color: "#059669", shape: "◆" },
    { label: "Potensi", color: "#2563EB", shape: "●" },
    { label: "Pertimbangkan", color: "#D97706", shape: "▬" },
    { label: "Tunda", color: "#64748B", shape: "■" },
  ];

  return (
    <section
      aria-label="Matriks 3D Kuadran LKPD 6"
      className="surface-card print-card mb-6 overflow-hidden relative z-0 isolate"
    >
      {/* Card header */}
      <div className="px-5 py-3.5 border-b border-border">
        <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold block mb-0.5">
          MATRIKS PRIORITAS 3D — LKPD 6
        </span>
        <h3 className="text-sm font-bold text-ink">
          Visualisasi Kuadran Keterlaksanaan × Dampak × Total Skor
        </h3>
        <p className="font-mono text-3xs text-muted mt-0.5 uppercase tracking-wider print:hidden">
          Seret untuk memutar · Scroll untuk zoom · Klik pin untuk inspeksi
        </p>
      </div>

      {/* Interactive 3D Canvas (screen only) */}
      <div className="print:hidden relative w-full h-[460px] isolate z-0">
        <Canvas
          camera={{ position: [PRINT_CAM_POS[0], 12, PRINT_CAM_POS[2]], fov: 40 }}
          shadows={false}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#F7F5F0"]} />

          <ambientLight intensity={0.8} color="#ffffff" />
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
                isHovered={
                  hoveredIdea?.id === idea.id || hoveredIdea?.code === idea.code
                }
                onClick={handleSelect}
                onPointerOver={handleHoverIn}
                onPointerOut={handleHoverOut}
              />
            ))}
          </Suspense>

          <OrbitControls
            ref={orbitRef}
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={3}
            maxDistance={18}
            enablePan
            onStart={() => {
              _camAnimating.current = false;
            }}
          />
          <CameraController
            orbitRef={orbitRef}
            onBridgeReady={handleBridgeReady}
          />
        </Canvas>

        {/* Inspection card */}
        <InspectionCard idea={inspectionIdea} />

        {/* Interactive Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 print:hidden">
          {LEGEND_ITEMS.map(({ label, color, shape }) => (
            <div
              key={label}
              className="flex items-center gap-1 bg-surface/90 border border-border px-2 py-0.5"
            >
              <span style={{ color, fontSize: "10px" }}>{shape}</span>
              <span className="font-mono text-3xs text-ink uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Print-only Centered WebGL Snapshot */}
      {matrixPrintImg && (
        <div className="hidden print:flex flex-col items-center justify-center w-full py-3 px-4">
          <img
            src={matrixPrintImg}
            alt="Visualisasi Matriks Kuadran 3D"
            className="w-full max-w-[660px] mx-auto h-auto object-contain border border-[#E2DDD5]"
          />
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2.5">
            {LEGEND_ITEMS.map(({ label, color, shape }) => (
              <div
                key={label}
                className="flex items-center gap-1 bg-surface border border-border px-2 py-0.5"
              >
                <span style={{ color, fontSize: "10px" }}>{shape}</span>
                <span className="font-mono text-3xs text-ink uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
});

export default Quadrant3DMatrix;

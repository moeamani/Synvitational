import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StudioLights from './StudioLights.jsx';

// A gold ribbon tied in a figure eight with one full twist, ruled with fine
// contour lines, after the festival-poster reference.

const P = t => new THREE.Vector3(0.92 * Math.sin(2 * t), 1.32 * Math.sin(t), 0.6 * Math.cos(t));

function frames(seg) {
  const up = new THREE.Vector3(0, 0, 1);
  const out = [];
  for (let i = 0; i <= seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    const p = P(t);
    const T = P(t + 1e-3).sub(P(t - 1e-3)).normalize();
    const B = new THREE.Vector3().crossVectors(T, up).normalize();
    const N = new THREE.Vector3().crossVectors(B, T).normalize();
    const W = B.clone().multiplyScalar(Math.cos(t)).addScaledVector(N, Math.sin(t));
    const n = new THREE.Vector3().crossVectors(T, W).normalize();
    out.push({ p, W, n });
  }
  return out;
}

function ribbon(fr, width) {
  const pos = [], nor = [], idx = [];
  fr.forEach(({ p, W, n }) => {
    for (const s of [-1, 1]) {
      const q = p.clone().addScaledVector(W, (s * width) / 2);
      pos.push(q.x, q.y, q.z);
      nor.push(n.x, n.y, n.z);
    }
  });
  for (let i = 0; i < fr.length - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

function contours(fr, width, count) {
  const lines = [];
  for (let k = 0; k < count; k++) {
    const o = ((k + 0.5) / count - 0.5) * width * 0.92;
    const pts = fr.map(({ p, W }) => p.clone().addScaledVector(W, o));
    lines.push(new THREE.BufferGeometry().setFromPoints(pts));
  }
  return lines;
}

export default function LineupScene({ shown, pointer, instant = false }) {
  const group = useRef();
  const born = useRef(null);
  const { geo, lines } = useMemo(() => {
    const fr = frames(720);
    return { geo: ribbon(fr, 0.62), lines: contours(fr, 0.62, 9) };
  }, []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ddb12a', metalness: 0.85, roughness: 0.26, side: THREE.DoubleSide,
    iridescence: 0.55, iridescenceIOR: 1.5, iridescenceThicknessRange: [220, 520],
    clearcoat: 0.5, envMapIntensity: 1.25,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  }), []);
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#fff6dc', transparent: true, opacity: 0.5 }), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (shown && born.current === null) born.current = t;
    const k = instant ? 1 : born.current === null ? 0 : THREE.MathUtils.clamp((t - born.current) / 1.6, 0, 1);
    const e = 1 - Math.pow(1 - k, 4);
    const g = group.current;
    const px = pointer ? pointer.x.get() : 0, py = pointer ? pointer.y.get() : 0;
    g.rotation.y = (1 - e) * -3 + t * 0.22 + px * 0.4;
    g.rotation.x = -0.35 + Math.sin(t * 0.4) * 0.08 + py * 0.25;
    g.rotation.z = -0.28;
    g.scale.setScalar((0.4 + 0.6 * e) * 0.6);
    g.position.set(0.3, 0.66 + Math.sin(t * 0.8) * 0.04, 0);
    lineMat.opacity = 0.5 * e;
  });

  return (
    <>
      <StudioLights />
      <group ref={group} scale={0.4}>
        <mesh geometry={geo} material={mat} />
        {lines.map((l, i) => <line key={i} geometry={l} material={lineMat} />)}
      </group>
    </>
  );
}

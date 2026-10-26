import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StudioLights from './StudioLights.jsx';

// The two Syntex chevrons as polished metal: gold ^ large, graphite ˇ small.
// Reflections slide across the bevels as they turn, which reads as liquid.

function chevronGeometry(depth = 0.42) {
  const a = 1, d = 0.46;
  const s = new THREE.Shape();
  s.moveTo(0, a / 2);
  s.lineTo(a, -a / 2);
  s.lineTo(a, -a / 2 - d);
  s.lineTo(0, a / 2 - d);
  s.lineTo(-a, -a / 2 - d);
  s.lineTo(-a, -a / 2);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.11, bevelSegments: 12, curveSegments: 6, steps: 2,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

function Chevron({ geometry, material, base, shown, pointer, delay = 0, spin = 1 }) {
  const ref = useRef();
  const born = useRef(null);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const m = ref.current;
    if (shown && born.current === null) born.current = t;
    const k = born.current === null ? 0 : THREE.MathUtils.clamp((t - born.current - delay) / 1.4, 0, 1);
    const e = 1 - Math.pow(1 - k, 4);
    const px = pointer ? pointer.x.get() : 0, py = pointer ? pointer.y.get() : 0;
    m.position.set(base.p[0], base.p[1] + (1 - e) * -2.2 + Math.sin(t * 0.9 + delay * 4) * 0.06, base.p[2]);
    m.rotation.x = base.r[0] + Math.sin(t * 0.5 + delay) * 0.18 * spin + py * 0.25;
    m.rotation.y = base.r[1] + (1 - e) * 2.6 + Math.sin(t * 0.35) * 0.55 * spin + px * 0.35;
    m.rotation.z = base.r[2] + Math.sin(t * 0.4 + 1) * 0.06;
    const sc = base.s * (0.55 + 0.45 * e);
    m.scale.setScalar(sc);
  });
  return <mesh ref={ref} geometry={geometry} material={material} scale={0.01} />;
}

export default function LiquidScene({ shown, pointer }) {
  const geometry = useMemo(() => chevronGeometry(), []);
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#f0c24a', metalness: 1, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6,
  }), []);
  const graphite = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#c9c7c2', metalness: 1, roughness: 0.16, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.4,
  }), []);
  return (
    <>
      <StudioLights warm />
      <Chevron geometry={geometry} material={gold} shown={shown} pointer={pointer}
        base={{ p: [-0.78, 0.12, 0], r: [0.22, -0.32, 0.12], s: 0.78 }} />
      <Chevron geometry={geometry} material={graphite} shown={shown} pointer={pointer} delay={0.25} spin={-1}
        base={{ p: [-0.72, -0.7, 0.1], r: [-0.18, 0.3, Math.PI - 0.08], s: 0.42 }} />
    </>
  );
}

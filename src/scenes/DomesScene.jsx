import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Two dark spheres lit from the gap between them: the Syntex ^ in gold above,
// the ˇ in grey below. The guest's name sits in that gap on the card.

const vert = /* glsl */ `
varying vec3 vN;
varying vec3 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const bodyFrag = /* glsl */ `
uniform vec3 uRim;
uniform vec3 uMid;
uniform vec3 uCore;
uniform vec3 uLight;
uniform float uTime;
uniform float uGain;
varying vec3 vN;
varying vec3 vW;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  vec3 l = normalize(uLight - vW);
  float lit = pow(max(dot(n, l), 0.0), 2.6);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.0);
  vec3 col = mix(uCore, uMid, lit);
  col = mix(col, uRim, clamp(pow(lit, 2.2) * 0.95 + fres * lit * 1.4, 0.0, 1.0));
  col *= uGain;
  col += (hash(gl_FragCoord.xy + fract(uTime * 7.0) * 91.0) - 0.5) * 0.035;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const haloFrag = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uLight;
uniform float uGain;
uniform float uTime;
varying vec3 vN;
varying vec3 vW;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float edge = pow(clamp(-dot(n, v), 0.0, 1.0), 1.6);
  float side = pow(max(dot(n, normalize(uLight - vW)), 0.0), 1.2);
  float a = edge * side * uGain;
  a += (hash(gl_FragCoord.xy + fract(uTime * 5.0) * 57.0) - 0.5) * 0.05 * a;
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}`;

function Dome({ radius, rim, mid, core, halo, dir, gap, shown, pointer, light }) {
  const group = useRef();
  const body = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: bodyFrag,
    toneMapped: false,
    uniforms: {
      uRim: { value: new THREE.Color(rim) },
      uMid: { value: new THREE.Color(mid) },
      uCore: { value: new THREE.Color(core) },
      uLight: { value: light },
      uTime: { value: 0 },
      uGain: { value: 0 },
    },
  }), [rim, mid, core, light]);
  const glow = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: haloFrag,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      uColor: { value: new THREE.Color(halo) },
      uLight: { value: light },
      uGain: { value: 0 },
      uTime: { value: 0 },
    },
  }), [halo, light]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const target = shown ? dir * (radius + gap / 2 + Math.sin(t * 0.7) * 0.025) : dir * (radius + 2.4);
    const g = group.current;
    g.position.y = THREE.MathUtils.damp(g.position.y, target, shown ? 2.2 : 6, dt);
    g.position.x = THREE.MathUtils.damp(g.position.x, (pointer ? pointer.x.get() : 0) * -0.08 * dir, 3, dt);
    const gainTo = shown ? 1 : 0.35;
    body.uniforms.uGain.value = THREE.MathUtils.damp(body.uniforms.uGain.value, gainTo, 1.6, dt);
    glow.uniforms.uGain.value = THREE.MathUtils.damp(glow.uniforms.uGain.value, shown ? 0.75 : 0, 1.2, dt);
    body.uniforms.uTime.value = t;
    glow.uniforms.uTime.value = t;
  });

  return (
    <group ref={group} position={[0, dir * (radius + 2.4), 0]}>
      <mesh material={body}>
        <sphereGeometry args={[radius, 128, 128]} />
      </mesh>
      <mesh material={glow} scale={1.09}>
        <sphereGeometry args={[radius, 96, 96]} />
      </mesh>
    </group>
  );
}

export default function DomesScene({ shown, pointer, gap = 1.4 }) {
  const light = useMemo(() => new THREE.Vector3(0, 0, -0.9), []);
  useFrame((state, dt) => {
    const px = pointer ? pointer.x.get() : 0;
    const py = pointer ? pointer.y.get() : 0;
    light.x = THREE.MathUtils.damp(light.x, px * 0.9, 2.5, dt);
    light.y = THREE.MathUtils.damp(light.y, -py * 0.25, 2.5, dt);
  });
  return (
    <>
      <Dome radius={1.95} dir={1} gap={gap} shown={shown} pointer={pointer} light={light}
        rim="#ffe7a1" mid="#ddb12a" core="#0b0904" halo="#ddb12a" />
      <Dome radius={1.95} dir={-1} gap={gap} shown={shown} pointer={pointer} light={light}
        rim="#f1efe9" mid="#7d7d7d" core="#080808" halo="#9a9a9a" />
    </>
  );
}

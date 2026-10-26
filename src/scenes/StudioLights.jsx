import { Environment, Lightformer } from '@react-three/drei';

// Procedural studio for the chrome materials. No HDR files: everything the
// reflections show is drawn here, so nothing is fetched at runtime.
export default function StudioLights({ warm = false }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={[warm ? '#6d6556' : '#141414']} />
      <Lightformer form="rect" intensity={4} color="#fff7e0" position={[0, 4, 3]} rotation-x={Math.PI / 2.4} scale={[10, 2.4, 1]} />
      <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[-5, 0.5, 2]} rotation-y={Math.PI / 2} scale={[6, 0.6, 1]} />
      <Lightformer form="rect" intensity={2.4} color="#ffe9b0" position={[5, -0.6, 2]} rotation-y={-Math.PI / 2} scale={[6, 0.5, 1]} />
      <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[2, 2, 6]} scale={2.5} />
      <Lightformer form="rect" intensity={1.2} color="#ddb12a" position={[0, -4, 1]} rotation-x={-Math.PI / 2} scale={[8, 3, 1]} />
    </Environment>
  );
}

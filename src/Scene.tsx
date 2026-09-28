import { Environment, Lightformer } from '@react-three/drei'
import { CameraRig } from './camera/CameraRig'
import { Robot } from './robot/Robot'

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[-4, 7, 10]} intensity={1.8} />
      <directionalLight position={[5, -4, -8]} intensity={0.8} color="#dfe8ff" />

      {/* Soft daylight reflections for the glossy shell, built locally (no HDR download). */}
      <Environment resolution={256}>
        <color attach="background" args={['#dfe4e9']} />
        <Lightformer intensity={2} position={[0, 5, 8]} scale={[10, 3, 1]} />
        <Lightformer intensity={1} position={[-8, 0, 2]} rotation-y={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer intensity={1} position={[8, 0, -2]} rotation-y={-Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer intensity={0.6} color="#dfe6ee" position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>

      <Robot />
      <CameraRig />
    </>
  )
}

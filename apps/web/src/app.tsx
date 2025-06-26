import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import prototype from '@/assets/textures/prototype.png'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Gor from './components/Gor'

export default function App() {
  return (
    <main className='w-dvw h-dvh'>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 1, 1]} intensity={1} />

        <color attach='background' args={['#000']} />
        <fog attach='fog' args={['#000', 10, 120]} />

        <PerspectiveCamera makeDefault position={[-30, 10, 30]} fov={25} />

        <Ground />

        <Gor scale={15} />

        <OrbitControls />
      </Canvas>
    </main>
  )
}

function Ground() {
  const texture = useTexture(prototype)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(20, 20)
  texture.offset.set(0, 0)

  return (
    <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

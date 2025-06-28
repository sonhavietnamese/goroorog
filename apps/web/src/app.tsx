import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import prototype from '@/assets/textures/prototype.png'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Gor from './components/gor'
import sampleHealthbar from '@/assets/sample-healthbar.png'
import sampleLeaderboard from '@/assets/sample-leaderboard.png'
import { useRef } from 'react'

export default function App() {
  return (
    <main className='w-dvw h-dvh'>
      <Hud />
      <Canvas>
        <ambientLight intensity={2} />

        <directionalLight position={[1, 1, 1]} intensity={1} />

        <color attach='background' args={['#000']} />
        {/* <fog attach='fog' args={['#000', 10, 120]} /> */}

        <Camera />

        <Ground />

        <Gor scale={15} position={[0, -0.5, 0]} />

        <OrbitControls />
      </Canvas>
    </main>
  )
}

function Camera() {
  const ref = useRef<THREE.PerspectiveCamera>(null)
  // const count = useRef(0)

  // useFrame(() => {
  //   if (ref.current) {
  //     console.log(ref.current.position)
  //   }
  // })

  return <PerspectiveCamera ref={ref} makeDefault position={[-30, 10, 30]} fov={25} />
}

function Hud() {
  return (
    <section className='w-full h-full flex flex-col pointer-events-none items-center justify-center absolute top-0 left-0 z-[1]'>
      <div className='absolute top-5 left-1/2 -translate-x-1/2'>
        <img src={sampleHealthbar} draggable={false} className='w-[600px]' />
      </div>
      <div className='absolute top-10 right-10'>
        <img src={sampleLeaderboard} draggable={false} className='w-[400px]' />
      </div>
    </section>
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

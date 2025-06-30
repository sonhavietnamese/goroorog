import aPlayerIndicatorTexture from '@/assets/textures/player-indicator.png'
import { useControlStore } from '@/stores/control'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function IndicatorPlayer() {
  const playerIndicatorTexture = useTexture(aPlayerIndicatorTexture)

  const playerIndicator = useRef<THREE.Mesh>(null)
  const characterStatus = useControlStore((state) => state.characterStatus)

  useFrame(() => {
    if (playerIndicator.current) {
      playerIndicator.current.rotation.z += 0.01
      playerIndicator.current.position.set(characterStatus.position.x, characterStatus.position.y - 0.7, characterStatus.position.z)
    }
  })

  return (
    <mesh ref={playerIndicator} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial map={playerIndicatorTexture} transparent />
    </mesh>
  )
}

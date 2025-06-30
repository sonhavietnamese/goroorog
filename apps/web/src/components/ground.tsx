import prototype from '@/assets/textures/prototype.png'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { StaticCollider } from './control'

export default function Ground() {
  const texture = useTexture(prototype)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(40, 40)
  texture.offset.set(0, 0)

  return (
    <StaticCollider>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </StaticCollider>
  )
}

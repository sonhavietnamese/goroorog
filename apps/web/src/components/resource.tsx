import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useControlStore } from '@/stores/control'
import { database } from '@/libs/firebase'
import { remove, ref } from 'firebase/database'
import { useProgram } from '@/hooks/use-program'
import { BitApple } from './resource-bit-apple'
import { TrashBag } from './resource-trash-bag'

type Resource = {
  id: string
  createdAt: string
  position: {
    x: number
    y: number
    z: number
  }
}

export default function Resource({ id, data }: { id: string; data: Resource }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const { characterStatus } = useControlStore()
  const { updateResource, getResource } = useProgram()

  const tick = useRef(0)

  const handleHit = async () => {
    const resourceRef = ref(database, `resources/${id}`)
    await remove(resourceRef)
    await updateResource(data.id)
    await getResource()
  }

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta
      if (tick.current % 10 === 0 && meshRef.current.position.distanceTo(characterStatus.position) < 2) {
        handleHit()
      }
    }

    tick.current += 1
  })

  return (
    <group ref={meshRef} key={id} position={[data.position.x, data.position.y, data.position.z]}>
      {data.id === '1' ? <BitApple /> : <TrashBag />}
    </group>
  )
}

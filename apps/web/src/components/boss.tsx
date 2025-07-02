import { database } from '@/libs/firebase'
import { useFrame } from '@react-three/fiber'
import { onValue, ref } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Gor from './gor'

const BASE_INNER_RADIUS = 1
const BASE_OUTER_RADIUS = 2
const SEGMENTS = 32

type ActionName = 'breath' | 'roar' | 'jump-attack' | 'swipe'

const ACTIONS: Record<string, ActionName> = {
  '1': 'swipe',
  '2': 'roar',
  '3': 'jump-attack',
}

export default function Boss() {
  const ring = useRef<THREE.Mesh>(null)
  const count = useRef(0)

  const [skill, setSkill] = useState<string>('breath')

  useEffect(() => {
    const bossRef = ref(database, 'boss')
    const unsubscribe = onValue(bossRef, (snapshot) => {
      setSkill(snapshot.val().skill || '1')
    })

    return () => unsubscribe()
  }, [])

  useFrame((state) => {
    if (ring.current) {
      count.current++

      const time = state.clock.elapsedTime

      const dynamicRadius = Math.abs(10 * Math.sin(time)) * 1

      const innerRadius = BASE_INNER_RADIUS + dynamicRadius
      const outerRadius = BASE_OUTER_RADIUS + dynamicRadius

      ring.current.geometry.dispose()
      ring.current.geometry = new THREE.RingGeometry(innerRadius, outerRadius, SEGMENTS)
    }
  })

  return (
    <group>
      <Gor scale={10} position={[0, -0.5, 0]} animation={ACTIONS[skill]} />

      {/* <mesh ref={ring} position={[-3, -0.4, 12]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[BASE_INNER_RADIUS, BASE_OUTER_RADIUS, SEGMENTS]} />
        <meshStandardMaterial color='red' />
      </mesh> */}
    </group>
  )
}

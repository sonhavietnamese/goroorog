import { ANIMATION_MAP } from '@/configs/animation'
import { database } from '@/libs/firebase'
import { useAuthStore } from '@/stores/auth'
import { useFrame } from '@react-three/fiber'
import { DataSnapshot, onValue, ref } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { CharacterAnimationStatus } from './control'
import Bana from './player-bana'

export default function PlayerRemote() {
  const [players, setPlayers] = useState<Record<string, any>>({})
  const { user } = useAuthStore()

  useEffect(() => {
    const usersRef = ref(database, 'users')
    const unsubscribe = onValue(usersRef, (snapshot: DataSnapshot) => {
      const players = snapshot.val()
      setPlayers(players)
    })

    return () => unsubscribe()
  }, [])

  return (
    <>
      {Object.entries(players).map(
        ([key, value]) =>
          key !== user?.uid && <RemoteBana key={key} animation={value.animation} position={value.position} quaternion={value.quaternion} id={key} />,
      )}
    </>
  )
}

interface RemoteBanaProps {
  position: [number, number, number]
  quaternion: [number, number, number, number]
  animation: CharacterAnimationStatus
  id: string
}

function RemoteBana({ position, quaternion, animation, id }: RemoteBanaProps) {
  const player = useRef<THREE.Group>(null)
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...position))
  const quaternionRef = useRef<THREE.Quaternion>(new THREE.Quaternion(0, 0, 0, 1))
  const [internalAnimation, setInternalAnimation] = useState<CharacterAnimationStatus>(animation)
  const prevAnimation = useRef<CharacterAnimationStatus>(animation)

  useEffect(() => {
    if (animation !== prevAnimation.current) {
      setInternalAnimation(animation)
      prevAnimation.current = animation
      console.log(ANIMATION_MAP[animation])
    }
  }, [animation])

  useFrame(() => {
    if (player.current) {
      positionRef.current.fromArray(position)
      quaternionRef.current.fromArray(quaternion)
      player.current.position.lerp(positionRef.current, 0.05)
      player.current.quaternion.slerp(quaternionRef.current, 0.05)
    }
  })

  return (
    <group ref={player}>
      <Bana animation={ANIMATION_MAP[internalAnimation]} name={id} />
    </group>
  )
}

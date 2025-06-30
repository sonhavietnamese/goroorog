import { ANIMATION_MAP } from '@/configs/animation'
import { database } from '@/libs/firebase'
import { useAuthStore } from '@/stores/auth'
import { Billboard, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { DataSnapshot, onValue, ref } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { CharacterAnimationStatus } from './control'
import Bana from './player-bana'
import { formatWalletAddress } from '@/libs/utils'
import type { Player } from '@/types'

export default function PlayerRemote() {
  const [players, setPlayers] = useState<Record<string, Player>>({})
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
          key !== user?.uid && (
            <RemoteBana
              key={key}
              animation={value.animation}
              position={value.position}
              quaternion={value.quaternion}
              id={key}
              address={value.address}
            />
          ),
      )}
    </>
  )
}

interface RemoteBanaProps {
  position: [number, number, number]
  quaternion: [number, number, number, number]
  animation: CharacterAnimationStatus
  address: string
  id: string
}

function RemoteBana({ position, quaternion, animation, id, address }: RemoteBanaProps) {
  const player = useRef<THREE.Group>(null)
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...position))
  const quaternionRef = useRef<THREE.Quaternion>(new THREE.Quaternion(0, 0, 0, 1))
  const [internalAnimation, setInternalAnimation] = useState<CharacterAnimationStatus>(animation)
  const prevAnimation = useRef<CharacterAnimationStatus>(animation)

  const fontProps = { font: '/fonts/TwinMarker.ttf', fontSize: 0.5, letterSpacing: -0.05, lineHeight: 1, 'material-toneMapped': false }

  useEffect(() => {
    if (animation !== prevAnimation.current) {
      setInternalAnimation(animation)
      prevAnimation.current = animation
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
    <group ref={player} dispose={null}>
      <Billboard>
        <Text {...fontProps} position={[0, 2.5, 0]}>
          {formatWalletAddress(address)}
        </Text>
      </Billboard>

      <Bana animation={ANIMATION_MAP[internalAnimation]} name={id} />
    </group>
  )
}

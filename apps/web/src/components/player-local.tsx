import { KEYBOARD_MAP } from '@/configs/keyboard'
import { database } from '@/libs/firebase'
import { getRandomSpawnPoint } from '@/libs/utils'
import { useAuthStore } from '@/stores/auth'
import { useControlStore } from '@/stores/control'
import { CameraControls, KeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useWallet } from '@solana/wallet-adapter-react'
import { ref, set } from 'firebase/database'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import Control, { type CharacterAnimationStatus, type ControlApi } from './control'
import Bana from './player-bana'
import { ANIMATION_MAP } from '@/configs/animation'

const THRESHOLD_DISTANCE = 0.2

export default function PlayerLocal() {
  const controlRef = useRef<ControlApi | null>(null)
  const camControlRef = useRef<CameraControls | null>(null)
  const lightRef = useRef<THREE.DirectionalLight | null>(null)
  const spawnPoint = useRef<THREE.Vector3>(getRandomSpawnPoint())

  const colliderMeshesArray = useControlStore((state) => state.colliderMeshesArray)
  const characterStatus = useControlStore((state) => state.characterStatus)
  const { user } = useAuthStore()

  const { publicKey } = useWallet()

  const tick = useRef(0)
  const lastPosition = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  const payload = useRef<{
    position: [number, number, number]
    quaternion: [number, number, number, number]
    address: string
    animation: CharacterAnimationStatus
  }>({
    address: publicKey?.toBase58() ?? '',
    position: [spawnPoint.current.x, spawnPoint.current.y, spawnPoint.current.z],
    quaternion: [0, 0, 0, 1],
    animation: 'IDLE',
  })

  useEffect(() => {
    if (publicKey && user) {
      payload.current.address = publicKey.toBase58()
      payload.current.position = [spawnPoint.current.x, spawnPoint.current.y, spawnPoint.current.z]

      set(ref(database, `users/${user.uid}`), payload.current)
    }
  }, [publicKey, user])

  useFrame(() => {
    if (controlRef.current && controlRef.current.group && camControlRef.current && lightRef.current) {
      camControlRef.current.moveTo(
        controlRef.current.group.position.x,
        controlRef.current.group.position.y + 3,
        controlRef.current.group.position.z,
        true,
      )

      lightRef.current.position.set(controlRef.current?.group.position.x ?? 0, 5, controlRef.current?.group.position.z)

      tick.current++

      if (user && lastPosition.current.distanceTo(controlRef.current?.group.position) > THRESHOLD_DISTANCE) {
        lastPosition.current.copy(controlRef.current?.group.position ?? new THREE.Vector3(0, 0, 0))

        set(ref(database, `users/${user.uid}`), {
          ...payload.current,
          position: [characterStatus.position.x, characterStatus.position.y, characterStatus.position.z],
          animation: characterStatus.animationStatus,
          quaternion: [characterStatus.quaternion.x, characterStatus.quaternion.y, characterStatus.quaternion.z, characterStatus.quaternion.w],
        })
      }
    }
  })

  return (
    <>
      <directionalLight ref={lightRef} position={[1, 5, 1]} intensity={1} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
      <CameraControls ref={camControlRef} smoothTime={0.1} colliderMeshes={colliderMeshesArray} makeDefault />
      <KeyboardControls map={KEYBOARD_MAP}>
        <Control
          ref={controlRef}
          maxWalkSpeed={10}
          maxRunSpeed={20}
          jumpVel={10}
          counterVelFactor={0}
          deceleration={100}
          acceleration={100}
          position={spawnPoint.current}>
          <Bana animation={ANIMATION_MAP[characterStatus.animationStatus]} />
        </Control>
      </KeyboardControls>
    </>
  )
}

import prototype from '@/assets/textures/prototype.png'
import Bana from '@/components/bana'
import Boss from '@/components/boss'
import type { BVHEcctrlApi } from '@/components/control'
import BVHEcctrl, { StaticCollider } from '@/components/control'
import IndicatorPlayer from '@/components/indicator-player'
import { ManagerSkill } from '@/components/manager-skill'
import { KEYBOARD_MAP } from '@/configs/keyboard'
import { useControlStore, type ControlState } from '@/stores/control'
import { CameraControls, KeyboardControls, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Game() {
  const controlRef = useRef<BVHEcctrlApi | null>(null)
  const camControlRef = useRef<CameraControls | null>(null)
  const colliderMeshesArray = useControlStore((state: ControlState) => state.colliderMeshesArray)

  useFrame(() => {
    if (controlRef.current && controlRef.current.group && camControlRef.current)
      camControlRef.current.moveTo(
        controlRef.current.group.position.x,
        controlRef.current.group.position.y,
        controlRef.current.group.position.z,
        true,
      )
  })

  return (
    <>
      <color attach='background' args={['#000000']} />
      <fog attach='fog' args={['#000000', 10, 150]} />

      <ambientLight intensity={2} />
      <directionalLight position={[1, 5, 1]} intensity={1} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />

      <Boss />

      <CameraControls ref={camControlRef} smoothTime={0.1} colliderMeshes={colliderMeshesArray} makeDefault />

      <KeyboardControls map={KEYBOARD_MAP}>
        <BVHEcctrl ref={controlRef} maxWalkSpeed={10} maxRunSpeed={20} jumpVel={20} counterVelFactor={0} deceleration={100} acceleration={100}>
          <Bana />
        </BVHEcctrl>
      </KeyboardControls>

      <IndicatorPlayer />

      <StaticCollider>
        <Ground />
      </StaticCollider>

      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>

      <ManagerSkill />
    </>
  )
}

function Ground() {
  const texture = useTexture(prototype)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(40, 40)
  texture.offset.set(0, 0)

  return (
    <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

import { useMagic } from '@/hooks/use-magic'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { lerp } from 'three/src/math/MathUtils.js'
import Skills from './skills'
import VFXS from './vfxs'
import SkillRemote from './skill-remote'

export const ManagerSkill = ({ ...props }) => {
  const update = useMagic((state) => state.update)

  const pointerPosition = useRef(new THREE.Vector3(0, 0.001, 0))
  const pointer = useRef<THREE.Mesh>(null)

  useFrame(({ clock }, delta) => {
    update(delta)
    const elapsedTime = clock.getElapsedTime()
    if (pointer.current && pointerPosition.current) {
      pointer.current.position.lerp(pointerPosition.current, 0.1)

      pointer.current.scale.x =
        pointer.current.scale.y =
        pointer.current.scale.z =
          lerp(pointer.current.scale.x, 2 + (Math.sin(elapsedTime * 4) + 0.5) * 1, 0.1)
    }
  })

  return (
    <group {...props}>
      <VFXS />
      <Skills />
      <SkillRemote />
    </group>
  )
}

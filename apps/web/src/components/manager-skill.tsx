import { useMagic } from '@/hooks/use-magic'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { lerp } from 'three/src/math/MathUtils.js'
import Skills from './skills'
import VFXS from './vfxs'

export const ManagerSkill = ({ ...props }) => {
  const update = useMagic((state) => state.update)
  // const skill = useMagic((state) => state.skill)
  // const addSkill = useMagic((state) => state.addSkill)

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
      {/* <mesh
        receiveShadow
        rotation-x={-Math.PI / 2}
        position-y={0.001}
        onPointerMove={(e) => pointerPosition.current.set(e.point.x, e.point.y + 0.001, e.point.z)}
        onClick={() => {
          addSkill({
            ...skill,
            position: pointerPosition.current.clone(),
            timestamp: Date.now(),
          })
        }}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.4} transparent />
      </mesh>
      <mesh ref={pointer} rotation-x={degToRad(-90)}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial emissive={skill.colors[0]} emissiveIntensity={2.5} />
      </mesh> */}
    </group>
  )
}

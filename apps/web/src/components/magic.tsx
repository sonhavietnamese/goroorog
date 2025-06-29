import { useMagic } from '@/hooks/use-magic'
import { RenderMode } from '@/types'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { degToRad, lerp } from 'three/src/math/MathUtils.js'
import AttackFire from './attack-fire'
import AttackIce from './attack-ice'
import AttackVoid from './attack-void'
import VFXParticles from './vfx-particles'

export const Magic = ({ ...props }) => {
  const update = useMagic((state) => state.update)
  const spell = useMagic((state) => state.spell)
  const addSpell = useMagic((state) => state.addSpell)

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
      <Spells />
      <mesh
        receiveShadow
        rotation-x={-Math.PI / 2}
        position-y={0.001}
        onPointerMove={(e) => pointerPosition.current.set(e.point.x, e.point.y + 0.001, e.point.z)}
        onClick={() => {
          addSpell({
            ...spell,
            position: pointerPosition.current.clone(),
          })
        }}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.4} transparent />
      </mesh>
      <mesh ref={pointer} rotation-x={degToRad(-90)}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial emissive={spell.colors[0]} emissiveIntensity={2.5} />
      </mesh>
    </group>
  )
}

const VFXS = () => {
  const texture = useTexture('textures/magic_01.png')
  const { nodes } = useGLTF('/models/Icicle.glb')

  return (
    <>
      <VFXParticles
        name='sparks'
        geometry={<coneGeometry args={[0.5, 1, 8, 1]} />}
        settings={{
          nbParticles: 100000,
          renderMode: RenderMode.Billboard,
          intensity: 3,
          fadeSize: [0.1, 0.1],
        }}
      />
      <VFXParticles
        name='spheres'
        geometry={<sphereGeometry args={[1, 32, 32]} />}
        settings={{
          nbParticles: 1000,
          renderMode: RenderMode.Mesh,
          intensity: 5,
          fadeSize: [0.7, 0.9],
          fadeAlpha: [0, 1],
        }}
      />
      <VFXParticles
        name='writings'
        geometry={<circleGeometry args={[1, 32]} />}
        alphaMap={texture}
        settings={{
          nbParticles: 100,
          renderMode: RenderMode.Mesh,
          fadeAlpha: [0.9, 1.0],
          fadeSize: [0.3, 0.9],
        }}
      />
      <VFXParticles
        name='icicle'
        geometry={<primitive object={nodes.icicle.geometry} />}
        settings={{
          nbParticles: 100,
          renderMode: RenderMode.Mesh,
          fadeAlpha: [0, 1.0],
          fadeSize: [0.2, 0.8],
        }}
      />
    </>
  )
}

const Spells = () => {
  const spells = useMagic((state) => state.spells)
  return spells.map((spell) =>
    spell.name === 'void' ? (
      <AttackVoid key={spell.id} position={spell.position} />
    ) : spell.name === 'fire' ? (
      <AttackFire key={spell.id} position={spell.position} />
    ) : (
      <AttackIce key={spell.id} position={spell.position} />
    ),
  )
}

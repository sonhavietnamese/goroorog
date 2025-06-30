import { useGLTF, useTexture } from '@react-three/drei'
import VFXParticles from './vfx-particles'
import { RenderMode } from '@/types'
import { type GLTF } from 'three-stdlib'
import * as THREE from 'three'

type IcicleGLTFResult = GLTF & {
  nodes: {
    icicle: THREE.Mesh
  }
  materials: {
    Material: THREE.MeshStandardMaterial
  }
}

export default function VFXS() {
  const texture = useTexture('textures/magic_01.png')
  const { nodes } = useGLTF('/models/Icicle.glb') as unknown as IcicleGLTFResult

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

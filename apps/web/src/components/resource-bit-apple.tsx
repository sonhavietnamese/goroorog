import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { type JSX } from 'react'
import type { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Line002: THREE.Mesh
  }
  materials: {
    ['Material #48']: THREE.MeshStandardMaterial
  }
}

export function BitApple(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/bit-apple-transformed.glb') as unknown as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Line002.geometry} material={materials['Material #48']} scale={0.5} />
    </group>
  )
}

useGLTF.preload('/models/bit-apple-transformed.glb')

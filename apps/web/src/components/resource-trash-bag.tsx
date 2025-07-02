import { useGLTF } from '@react-three/drei'
import { type JSX } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Trash_Bag: THREE.Mesh
  }
  materials: {
    Trash_Bag: THREE.MeshStandardMaterial
  }
}

export function TrashBag(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/trash-bag-transformed.glb') as unknown as GLTFResult

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Trash_Bag.geometry} material={materials.Trash_Bag} rotation={[Math.PI / 2, 0, 0]} scale={0.03} />
    </group>
  )
}

useGLTF.preload('/models/trash-bag-transformed.glb')

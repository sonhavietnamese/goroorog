import { type ActionName } from '@/configs/animation'
import { useAnimations, useGLTF } from '@react-three/drei'
import { useGraph } from '@react-three/fiber'
import React, { useEffect, useRef, type JSX } from 'react'
import * as THREE from 'three'
import { SkeletonUtils, type GLTF } from 'three-stdlib'

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName
}

type GLTFResult = GLTF & {
  nodes: {
    tmpzvx9c3bcply: THREE.SkinnedMesh
    spine: THREE.Bone
  }
  materials: {
    Material_0: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

type BanaProps = JSX.IntrinsicElements['group'] & {
  animation?: ActionName
}

export default function Bana({ animation = 'idle', ...props }: BanaProps) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/bana-transformed.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const clip = actions?.[animation]
    if (clip) {
      clip.reset().fadeIn(0.2).play()
    }

    return () => {
      if (clip) {
        clip.fadeOut(0.2)
      }
    }
  }, [actions, animation])

  return (
    <group ref={group} position={[0, -0.9, 0]} scale={1} receiveShadow castShadow {...props} dispose={null}>
      <primitive object={nodes.spine} />
      <skinnedMesh receiveShadow castShadow name='tmpzvx9c3bcply' geometry={nodes.tmpzvx9c3bcply.geometry} skeleton={nodes.tmpzvx9c3bcply.skeleton}>
        <meshStandardMaterial map={materials.Material_0.map} />
      </skinnedMesh>
    </group>
  )
}

useGLTF.preload('/bana-transformed.glb')

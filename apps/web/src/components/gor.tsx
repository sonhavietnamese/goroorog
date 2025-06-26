import { useAnimations, useGLTF } from '@react-three/drei'
import { useGraph } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type JSX } from 'react'
import * as THREE from 'three'
import { SkeletonUtils, type GLTF } from 'three-stdlib'

type ActionName = 'breath' | 'idle' | 'jump-attack' | 'roar' | 'swipe'

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName
}

type GLTFResult = GLTF & {
  nodes: {
    textured_meshobj: THREE.SkinnedMesh
    spine: THREE.Bone
    neutral_bone: THREE.Bone
  }
  materials: {
    PBR_Material: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

export default function Gor(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/gor-transformed.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    actions['breath']?.reset().fadeIn(0.5).play()

    return () => {
      actions['breath']?.fadeOut(0.5)
    }
  }, [actions])

  return (
    <group ref={group} {...props} dispose={null}>
      <group name='Scene'>
        <group name='metarig' rotation={[-3.128, -0.02, -3.127]}>
          <primitive object={nodes.spine} />
          <primitive object={nodes.neutral_bone} />
          <skinnedMesh name='textured_meshobj' geometry={nodes.textured_meshobj.geometry} skeleton={nodes.textured_meshobj.skeleton}>
            <meshStandardMaterial map={materials.PBR_Material.map} roughness={1} metalness={0} />
          </skinnedMesh>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/gor-transformed.glb')

import { useControlStore } from '@/stores/control'
import { Outlines, useAnimations, useGLTF } from '@react-three/drei'
import { useGraph } from '@react-three/fiber'
import React, { useEffect, useRef, type JSX } from 'react'
import * as THREE from 'three'
import { type GLTF, SkeletonUtils } from 'three-stdlib'
import type { CharacterAnimationStatus } from './control'

type ActionName = 'dance' | 'die' | 'idle' | 'run' | 'walk'

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

const ANIMATION_MAP: Partial<Record<CharacterAnimationStatus, ActionName>> = {
  IDLE: 'idle',
  RUN: 'run',
  WALK: 'walk',
}

export default function Bana(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/bana-transformed.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions } = useAnimations(animations, group)
  const characterStatus = useControlStore((state) => state.characterStatus)

  useEffect(() => {
    const clip = actions?.[ANIMATION_MAP[characterStatus.animationStatus] ?? 'idle']
    if (clip) {
      clip.reset().fadeIn(0.2).play()
    }

    return () => {
      if (clip) {
        clip.fadeOut(0.2)
      }
    }
  }, [characterStatus.animationStatus, actions])

  return (
    <group ref={group} {...props} dispose={null}>
      <group name='metarig' position={[0.101, 0.06, 0.083]} rotation={[0, 0, 0]} scale={0.559}>
        <primitive object={nodes.spine} />
        <skinnedMesh name='tmpzvx9c3bcply' geometry={nodes.tmpzvx9c3bcply.geometry} skeleton={nodes.tmpzvx9c3bcply.skeleton}>
          <meshStandardMaterial map={materials.Material_0.map} />
          <Outlines thickness={2} color='white' />
        </skinnedMesh>
      </group>
    </group>
  )
}

useGLTF.preload('/bana-transformed.glb')

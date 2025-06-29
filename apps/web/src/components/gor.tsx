import { useAnimations, useGLTF } from '@react-three/drei'
import { useGraph } from '@react-three/fiber'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type JSX } from 'react'
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

const Gor = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/gor-transformed.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions } = useAnimations(animations, group)

  useImperativeHandle(ref, () => group.current as THREE.Group, [])

  useEffect(() => {
    actions['idle']?.reset().fadeIn(0.5).play()

    return () => {
      actions['idle']?.fadeOut(0.5)
    }
  }, [actions])

  return (
    <group ref={group} {...props} dispose={null}>
      <group name='metarig' rotation={[-3.128, -0.02, -3.127]}>
        <primitive castShadow receiveShadow object={nodes.spine} />
        <primitive object={nodes.neutral_bone} />
        <skinnedMesh
          castShadow
          receiveShadow
          name='textured_meshobj'
          geometry={nodes.textured_meshobj.geometry}
          skeleton={nodes.textured_meshobj.skeleton}>
          <meshStandardMaterial map={materials.PBR_Material.map} roughness={1} metalness={0} />
        </skinnedMesh>
      </group>
    </group>
  )
})

useGLTF.preload('/gor-transformed.glb')

export default Gor

import { useControlStore } from '@/stores/control'
import { useThree } from '@react-three/fiber'
import React, { forwardRef, useEffect, useRef, type ReactNode, type RefObject } from 'react'
import * as THREE from 'three'
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  MeshBVHHelper,
  SAH,
  StaticGeometryGenerator,
  type SplitStrategy,
} from 'three-mesh-bvh'

export interface StaticColliderProps extends Omit<React.ComponentProps<'group'>, 'ref'> {
  children?: ReactNode
  debug?: boolean
  debugVisualizeDepth?: number
  restitution?: number
  friction?: number
  excludeFloatHit?: boolean
  excludeCollisionCheck?: boolean
  BVHOptions?: {
    strategy?: SplitStrategy
    verbose?: boolean
    setBoundingBox?: boolean
    maxDepth?: number
    maxLeafTris?: number
    indirect?: boolean
  }
}

const StaticCollider = forwardRef<THREE.Group, StaticColliderProps>(
  (
    {
      children,
      debug = false,
      restitution = 0.05,
      friction = 0.8,
      excludeFloatHit = false,
      excludeCollisionCheck = false,
      BVHOptions = {
        strategy: SAH,
        verbose: false,
        setBoundingBox: true,
        maxDepth: 40,
        maxLeafTris: 10,
        indirect: false,
      },
      ...props
    },
    ref,
  ) => {
    const { scene } = useThree()
    const mergedMesh = useRef<THREE.Mesh | null>(null)
    const bvhHelper = useRef<MeshBVHHelper | null>(null)
    const internalColliderRef = useRef<THREE.Group | null>(null)
    const colliderRef = (ref as RefObject<THREE.Group>) ?? internalColliderRef

    useEffect(() => {
      if (!colliderRef.current) return
      colliderRef.current.updateMatrixWorld(true)

      const meshes: THREE.Mesh[] = []
      colliderRef.current.traverse((obj) => {
        if (!('isMesh' in obj && (obj as THREE.Mesh).isMesh)) return
        const mesh = obj as THREE.Mesh
        const geometry = mesh.geometry

        const position = geometry.getAttribute('position')
        const normal = geometry.getAttribute('normal')
        if (!position || !normal) return
        const geom = geometry.index ? geometry.toNonIndexed() : geometry.clone()

        const cleanGeom = new THREE.BufferGeometry()
        cleanGeom.setAttribute('position', geom.getAttribute('position').clone())
        cleanGeom.setAttribute('normal', geom.getAttribute('normal').clone())
        cleanGeom.applyMatrix4(mesh.matrixWorld)

        meshes.push(new THREE.Mesh(cleanGeom))
      })

      if (meshes.length === 0) {
        console.warn('No compatible meshes found for static geometry generation.')
        return
      }

      const staticGenerator = new StaticGeometryGenerator(meshes)
      staticGenerator.attributes = ['position', 'normal']
      const mergedGeometry = staticGenerator.generate()

      mergedGeometry.computeBoundsTree = computeBoundsTree
      mergedGeometry.disposeBoundsTree = disposeBoundsTree
      mergedGeometry.computeBoundsTree(BVHOptions)
      mergedMesh.current = new THREE.Mesh(mergedGeometry)
      mergedMesh.current.raycast = acceleratedRaycast
      mergedMesh.current.userData = { restitution, friction, excludeFloatHit, excludeCollisionCheck, type: 'STATIC' }

      useControlStore.getState().setColliderMeshesArray(mergedMesh.current)

      return () => {
        if (mergedMesh.current) {
          useControlStore.getState().removeColliderMesh(mergedMesh.current)
          mergedMesh.current.geometry.disposeBoundsTree?.()
          mergedMesh.current.geometry.dispose()
          if (Array.isArray(mergedMesh.current.material)) {
            mergedMesh.current.material.forEach((mat) => mat.dispose())
          } else {
            mergedMesh.current.material.dispose()
          }
          mergedMesh.current.raycast = THREE.Mesh.prototype.raycast
          mergedMesh.current = null
        }
        for (const m of meshes) {
          m.raycast = THREE.Mesh.prototype.raycast
          m.geometry.dispose()
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose())
          } else {
            m.material.dispose()
          }
        }
        if (bvhHelper.current) {
          scene.remove(bvhHelper.current)
          // @ts-expect-error - TODO: fix this
          bvhHelper.current.dispose?.()
          bvhHelper.current = null
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      if (mergedMesh.current) {
        mergedMesh.current.visible = props.visible ?? true
        mergedMesh.current.userData.friction = friction
        mergedMesh.current.userData.restitution = restitution
        mergedMesh.current.userData.excludeFloatHit = excludeFloatHit
        mergedMesh.current.userData.excludeCollisionCheck = excludeCollisionCheck
      }
    }, [props.visible, friction, restitution, excludeFloatHit, excludeCollisionCheck])

    useEffect(() => {
      if (mergedMesh.current) {
        if (bvhHelper.current) {
          bvhHelper.current.visible = debug
        } else {
          bvhHelper.current = new MeshBVHHelper(mergedMesh.current, 20)
          bvhHelper.current.visible = debug
          scene.add(bvhHelper.current)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debug])

    return (
      <group ref={colliderRef} {...props} dispose={null}>
        {children}
      </group>
    )
  },
)

export default React.memo(StaticCollider)

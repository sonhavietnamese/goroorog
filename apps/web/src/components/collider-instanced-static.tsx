import { useThree } from '@react-three/fiber'
import React, { forwardRef, useEffect, useRef, type ReactNode, type RefObject } from 'react'
import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, MeshBVHHelper, SAH, type SplitStrategy } from 'three-mesh-bvh'
import { useControlStore } from '@/stores/control'

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

const InstancedStaticCollider = forwardRef<THREE.Group, StaticColliderProps>(
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
    /**
     * Initialize setups
     */
    const { scene } = useThree()
    const mergedMesh = useRef<THREE.InstancedMesh | null>(null)
    const bvhHelper = useRef<MeshBVHHelper | null>(null)
    const internalColliderRef = useRef<THREE.Group | null>(null)
    const colliderRef = (ref as RefObject<THREE.Group>) ?? internalColliderRef
    const tempMatrix = useRef<THREE.Matrix4>(new THREE.Matrix4())

    useEffect(() => {
      if (!colliderRef.current) return
      colliderRef.current.updateMatrixWorld(true)

      colliderRef.current.traverse((obj) => {
        if (!(obj instanceof THREE.InstancedMesh)) return
        const mesh = obj as THREE.InstancedMesh
        const geometry = mesh.geometry

        const position = geometry.getAttribute('position')
        const normal = geometry.getAttribute('normal')
        if (!position || !normal) return
        const baseGeom = geometry.index ? geometry.toNonIndexed() : geometry.clone()

        const cleanGeom = new THREE.BufferGeometry()
        cleanGeom.setAttribute('position', baseGeom.getAttribute('position').clone())
        cleanGeom.setAttribute('normal', baseGeom.getAttribute('normal').clone())
        cleanGeom.applyMatrix4(mesh.matrixWorld)

        // Create boundsTree and mesh from clean geometry
        cleanGeom.computeBoundsTree = computeBoundsTree
        cleanGeom.disposeBoundsTree = disposeBoundsTree
        cleanGeom.computeBoundsTree(BVHOptions)

        // Create inteanced mergedMesh from cleanGeom
        mergedMesh.current = new THREE.InstancedMesh(cleanGeom, undefined, mesh.count)
        // Apply mesh individual matrix to mergedMesh individual matrix
        for (let i = 0; i < mesh.count; i++) {
          mesh.getMatrixAt(i, tempMatrix.current)
          tempMatrix.current.premultiply(mesh.matrix)
          mergedMesh.current.setMatrixAt(i, tempMatrix.current)
        }
        mergedMesh.current.instanceMatrix.needsUpdate = true

        // Preset merged mesh user data
        mergedMesh.current.userData = { restitution, friction, excludeFloatHit, excludeCollisionCheck, type: 'STATIC' }

        // Save the merged mesh to globle store
        // Character can retrieve and collider with merged mesh later
        useControlStore.getState().setColliderMeshesArray(mergedMesh.current)
      })

      // Clean up geometry/boundsTree/mesh/bvhHelper
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
          mergedMesh.current = null
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

export default React.memo(InstancedStaticCollider)

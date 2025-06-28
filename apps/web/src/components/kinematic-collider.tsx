import { useFrame, useThree } from '@react-three/fiber'
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
import { clamp } from 'three/src/math/MathUtils.js'
import { useControlStore } from '@/stores/control'

export interface KinematicColliderProps extends Omit<React.ComponentProps<'group'>, 'ref'> {
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

const KinematicCollider = forwardRef<THREE.Group, KinematicColliderProps>(
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

    /**
     * Kinematic platform preset
     */
    const prevPosition = useRef<THREE.Vector3>(new THREE.Vector3())
    const prevQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion())
    const invertPrevQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion())
    const currentPosition = useRef<THREE.Vector3>(new THREE.Vector3())
    const currentQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion())
    const linearVelocity = useRef<THREE.Vector3>(new THREE.Vector3())
    const angularVelocity = useRef<THREE.Vector3>(new THREE.Vector3())
    const prevAngularVelocity = useRef<THREE.Vector3>(new THREE.Vector3())
    const rotationAxis = useRef<THREE.Vector3>(new THREE.Vector3())
    const deltaPos = useRef<THREE.Vector3>(new THREE.Vector3())
    const deltaQuat = useRef<THREE.Quaternion>(new THREE.Quaternion())

    /**
     * Generate merged static geometry and BVH tree for collision detection
     */
    useEffect(() => {
      // Exit if colliderRef.current if not ready
      if (!colliderRef.current) return
      // Recalculate the world matrix of the object and descendants on the current frame
      colliderRef.current.updateMatrixWorld(true)

      // Retrieve meshes from colliderRef.current
      const meshes: THREE.Mesh[] = []
      // colliderRef.current.traverse(obj => { if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh); });
      colliderRef.current.traverse((obj) => {
        if (!('isMesh' in obj && (obj as THREE.Mesh).isMesh)) return
        const mesh = obj as THREE.Mesh
        const geometry = mesh.geometry

        // Skip if missing required attributes
        const position = geometry.getAttribute('position')
        const normal = geometry.getAttribute('normal')
        if (!position || !normal) return
        // Clone and convert to non-indexed
        const geom = geometry.index ? geometry.toNonIndexed() : geometry.clone()

        // Strip everything except position and normal and apply matrix transform
        const cleanGeom = new THREE.BufferGeometry()
        cleanGeom.setAttribute('position', geom.getAttribute('position').clone())
        cleanGeom.setAttribute('normal', geom.getAttribute('normal').clone())
        cleanGeom.applyMatrix4(mesh.matrixWorld)

        meshes.push(new THREE.Mesh(cleanGeom))
      })

      // Early exit if no compatible meshes
      if (meshes.length === 0) {
        console.warn('No compatible meshes found for static geometry generation.')
        return
      }

      // Generate static geometry from mesh array
      const staticGenerator = new StaticGeometryGenerator(meshes)
      staticGenerator.attributes = ['position', 'normal']
      const mergedGeometry = staticGenerator.generate()

      // Create boundsTree and mesh from static geometry
      mergedGeometry.computeBoundsTree = computeBoundsTree
      mergedGeometry.disposeBoundsTree = disposeBoundsTree
      mergedGeometry.computeBoundsTree(BVHOptions)
      mergedMesh.current = new THREE.Mesh(mergedGeometry)
      mergedMesh.current.raycast = acceleratedRaycast
      // Update user data in merged mesh
      mergedMesh.current.userData = {
        restitution,
        friction,
        excludeFloatHit,
        excludeCollisionCheck,
        type: 'KINEMATIC',
        deltaPos: new THREE.Vector3(),
        deltaQuat: new THREE.Quaternion(),
        rotationAxis: new THREE.Vector3(),
        rotationAngle: 0,
        linearVelocity: new THREE.Vector3(),
        angularVelocity: new THREE.Vector3(),
        center: new THREE.Vector3(),
      }

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

    /**
     * Update BVH debug helper
     */
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

    useFrame((_, delta) => {
      if (!mergedMesh.current || !colliderRef.current) return
      prevPosition.current.copy(currentPosition.current)
      prevQuaternion.current.copy(currentQuaternion.current)

      colliderRef.current.updateMatrixWorld(true)
      mergedMesh.current.matrix.copy(colliderRef.current.matrixWorld)
      mergedMesh.current.matrix.decompose(mergedMesh.current.position, mergedMesh.current.quaternion, mergedMesh.current.scale)
      mergedMesh.current.updateMatrixWorld(true)

      mergedMesh.current.getWorldPosition(currentPosition.current)
      mergedMesh.current.getWorldQuaternion(currentQuaternion.current)

      deltaPos.current.copy(currentPosition.current).sub(prevPosition.current)
      linearVelocity.current.copy(deltaPos.current).divideScalar(delta)

      invertPrevQuaternion.current.copy(prevQuaternion.current).invert()
      deltaQuat.current.copy(currentQuaternion.current).multiply(invertPrevQuaternion.current)
      if (deltaQuat.current.w < 0) {
        deltaQuat.current.x *= -1
        deltaQuat.current.y *= -1
        deltaQuat.current.z *= -1
        deltaQuat.current.w *= -1
      }
      deltaQuat.current.normalize()
      const rotationAngle = 2 * Math.acos(clamp(deltaQuat.current.w, -1, 1))
      if (rotationAngle > 1e-6) {
        const sinHalfAngle = Math.sin(rotationAngle / 2)
        rotationAxis.current
          .set(deltaQuat.current.x / sinHalfAngle, deltaQuat.current.y / sinHalfAngle, deltaQuat.current.z / sinHalfAngle)
          .normalize()
      } else {
        rotationAxis.current.set(0, 0, 0)
      }

      angularVelocity.current
        .copy(rotationAxis.current)
        .multiplyScalar(rotationAngle / delta)
        .lerp(prevAngularVelocity.current, 0.3)
      prevAngularVelocity.current.copy(angularVelocity.current)

      mergedMesh.current.userData.deltaPos = deltaPos.current
      mergedMesh.current.userData.deltaQuat = deltaQuat.current
      mergedMesh.current.userData.rotationAxis = rotationAxis.current
      mergedMesh.current.userData.rotationAngle = rotationAngle
      mergedMesh.current.userData.linearVelocity = linearVelocity.current
      mergedMesh.current.userData.angularVelocity = angularVelocity.current
      mergedMesh.current.userData.center = currentPosition.current
    })

    return (
      <group ref={colliderRef} {...props} dispose={null}>
        {children}
      </group>
    )
  },
)

export default React.memo(KinematicCollider)

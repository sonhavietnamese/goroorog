import type { CharacterStatus } from '@/components/control'
import * as THREE from 'three'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type ControlState = {
  colliderMeshesArray: THREE.Mesh[]
  setColliderMeshesArray: (mergedMesh: THREE.Mesh) => void
  removeColliderMesh: (mergedMesh: THREE.Mesh) => void
  characterStatus: CharacterStatus
  setCharacterStatus: (status: CharacterStatus) => void
}

export const useControlStore = /* @__PURE__ */ create(
  /* @__PURE__ */ subscribeWithSelector<ControlState>((set) => {
    return {
      colliderMeshesArray: [],
      setColliderMeshesArray: (mergedMesh: THREE.Mesh) =>
        set((state) => {
          if (!state.colliderMeshesArray.includes(mergedMesh)) {
            return {
              colliderMeshesArray: [...state.colliderMeshesArray, mergedMesh],
            }
          }
          return state
        }),
      removeColliderMesh: (meshToRemove: THREE.Mesh) =>
        set((state) => ({
          colliderMeshesArray: state.colliderMeshesArray.filter((mesh) => mesh !== meshToRemove),
        })),

      characterStatus: {
        position: new THREE.Vector3(),
        linvel: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
        inputDir: new THREE.Vector3(),
        movingDir: new THREE.Vector3(),
        isOnGround: false,
        isOnMovingPlatform: false,
        animationStatus: 'IDLE',
      },
      setCharacterStatus: (status: CharacterStatus) =>
        set(() => ({
          characterStatus: status,
        })),
    }
  }),
)

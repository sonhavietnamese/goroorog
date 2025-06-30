import { useFrame } from '@react-three/fiber'
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Euler, Quaternion, Vector3 } from 'three'
import { randFloat, randInt } from 'three/src/math/MathUtils.js'
import { VFXBuilderEmitter } from './vfx-builder'
import { useVFX } from '@/stores/vfx'

const worldPosition = new Vector3()
const worldQuaternion = new Quaternion()
const worldEuler = new Euler()
const worldRotation = new Euler()
const worldScale = new Vector3()

import * as THREE from 'three'

export interface VFXEmitterSettings {
  duration?: number
  nbParticles?: number
  spawnMode?: 'time' | 'burst'
  loop?: boolean
  delay?: number
  colorStart?: string[]
  colorEnd?: string[]
  particlesLifetime?: [number, number]
  speed?: [number, number]
  size?: [number, number]
  startPositionMin?: [number, number, number]
  startPositionMax?: [number, number, number]
  startRotationMin?: [number, number, number]
  startRotationMax?: [number, number, number]
  rotationSpeedMin?: [number, number, number]
  rotationSpeedMax?: [number, number, number]
  directionMin?: [number, number, number]
  directionMax?: [number, number, number]
}

export interface VFXEmitterProps {
  debug?: boolean
  settings: VFXEmitterSettings
  emitter: string
  localDirection?: boolean
  autoStart?: boolean
  children?: React.ReactNode
}

export interface VFXEmitterRef extends THREE.Object3D {
  startEmitting: (reset?: boolean) => void
  stopEmitting: () => void
  emitAtPos: (position: THREE.Vector3 | null, reset?: boolean) => void
}

const VFXEmitter = forwardRef<VFXEmitterRef, VFXEmitterProps>(
  ({ debug, emitter, settings = {}, localDirection, autoStart = true, ...props }, forwardedRef) => {
    const [
      {
        duration = 1,
        nbParticles = 1000,
        spawnMode = 'time', // time, burst
        loop = false,
        delay = 0,
        colorStart = ['white', 'skyblue'],
        colorEnd = [],
        particlesLifetime = [0.1, 1],
        speed = [5, 20],
        size = [0.1, 1],
        startPositionMin = [-1, -1, -1],
        startPositionMax = [1, 1, 1],
        startRotationMin = [0, 0, 0],
        startRotationMax = [0, 0, 0],
        rotationSpeedMin = [0, 0, 0],
        rotationSpeedMax = [0, 0, 0],
        directionMin = [0, 0, 0],
        directionMax = [0, 0, 0],
      },
      setSettings,
    ] = useState(settings)

    const emitted = useRef(0)
    const elapsedTime = useRef(0)
    const currentTime = useRef(0)
    const ref = useRef<THREE.Object3D>(null!)

    const emit = useVFX((state) => state.emit)

    const shouldEmitRef = useRef<boolean>(autoStart)

    const stopEmitting = useCallback(() => {
      shouldEmitRef.current = false
    }, [])

    const startEmitting = useCallback((reset: boolean = false) => {
      if (reset) {
        emitted.current = 0
        elapsedTime.current = 0
      }
      shouldEmitRef.current = true
    }, [])

    const emitAtPos = useCallback((pos: Vector3 | null, reset: boolean = false) => {
      if (spawnMode !== 'burst') {
        console.error('This function is meant to be used with burst spawn mode only.')
      }
      const rate = nbParticles - emitted.current
      if (reset) {
        emitted.current = 0
        elapsedTime.current = 0
      }

      if (pos && ref.current) {
        ref.current.position.x = pos.x
        ref.current.position.y = pos.y
        ref.current.position.z = pos.z
      }

      ref.current.updateWorldMatrix(true, true)
      const worldMatrix = ref.current.matrixWorld
      worldMatrix.decompose(worldPosition, worldQuaternion, worldScale)
      worldEuler.setFromQuaternion(worldQuaternion)
      worldRotation.setFromQuaternion(worldQuaternion)

      emit(emitter, rate, () => {
        const randSize = randFloat(size[0], size[1])
        const color = colorStart[randInt(0, colorStart.length - 1)]
        return {
          position: [
            worldPosition.x + randFloat(startPositionMin[0], startPositionMax[0]),
            worldPosition.y + randFloat(startPositionMin[1], startPositionMax[1]),
            worldPosition.z + randFloat(startPositionMin[2], startPositionMax[2]),
          ],
          direction: (() => {
            const dir = new Vector3(
              randFloat(directionMin[0], directionMax[0]),
              randFloat(directionMin[1], directionMax[1]),
              randFloat(directionMin[2], directionMax[2]),
            )
            if (localDirection) dir.applyQuaternion(worldQuaternion)
            return [dir.x, dir.y, dir.z]
          })(),
          scale: [randSize, randSize, randSize],
          rotation: [
            worldRotation.x + randFloat(startRotationMin[0], startRotationMax[0]),
            worldRotation.y + randFloat(startRotationMin[1], startRotationMax[1]),
            worldRotation.z + randFloat(startRotationMin[2], startRotationMax[2]),
          ],
          rotationSpeed: [
            randFloat(rotationSpeedMin[0], rotationSpeedMax[0]),
            randFloat(rotationSpeedMin[1], rotationSpeedMax[1]),
            randFloat(rotationSpeedMin[2], rotationSpeedMax[2]),
          ],
          lifetime: [currentTime.current, randFloat(particlesLifetime[0], particlesLifetime[1])],
          colorStart: color,
          colorEnd: colorEnd?.length ? colorEnd[randInt(0, colorEnd.length - 1)] : color,
          speed: [randFloat(speed[0], speed[1])],
        }
      })
    }, [])

    useImperativeHandle(
      forwardedRef,
      () =>
        ({
          ...ref.current,
          stopEmitting,
          startEmitting,
          emitAtPos,
        }) as VFXEmitterRef,
    )

    useFrame(({ clock }, delta) => {
      const time = clock.getElapsedTime()
      currentTime.current = time
      const shouldEmit = shouldEmitRef.current

      if (emitted.current < nbParticles || loop) {
        if (!ref || !shouldEmit) {
          return
        }
        const particlesToEmit =
          spawnMode === 'burst' ? nbParticles : Math.max(0, Math.floor(((elapsedTime.current - delay) / duration) * nbParticles))

        const rate = particlesToEmit - emitted.current
        if (rate > 0 && elapsedTime.current >= delay) {
          emit(emitter, rate, () => {
            ref.current.updateWorldMatrix(true, true)
            const worldMatrix = ref.current.matrixWorld
            worldMatrix.decompose(worldPosition, worldQuaternion, worldScale)
            worldEuler.setFromQuaternion(worldQuaternion)
            worldRotation.setFromQuaternion(worldQuaternion)

            const randSize = randFloat(size[0], size[1])
            const color = colorStart[randInt(0, colorStart.length - 1)]
            return {
              position: [
                worldPosition.x + randFloat(startPositionMin[0], startPositionMax[0]),
                worldPosition.y + randFloat(startPositionMin[1], startPositionMax[1]),
                worldPosition.z + randFloat(startPositionMin[2], startPositionMax[2]),
              ],
              direction: (() => {
                const dir = new Vector3(
                  randFloat(directionMin[0], directionMax[0]),
                  randFloat(directionMin[1], directionMax[1]),
                  randFloat(directionMin[2], directionMax[2]),
                )
                if (localDirection) dir.applyQuaternion(worldQuaternion)
                return [dir.x, dir.y, dir.z]
              })(),
              scale: [randSize, randSize, randSize],
              rotation: [
                worldRotation.x + randFloat(startRotationMin[0], startRotationMax[0]),
                worldRotation.y + randFloat(startRotationMin[1], startRotationMax[1]),
                worldRotation.z + randFloat(startRotationMin[2], startRotationMax[2]),
              ],
              rotationSpeed: [
                randFloat(rotationSpeedMin[0], rotationSpeedMax[0]),
                randFloat(rotationSpeedMin[1], rotationSpeedMax[1]),
                randFloat(rotationSpeedMin[2], rotationSpeedMax[2]),
              ],
              lifetime: [time, randFloat(particlesLifetime[0], particlesLifetime[1])],
              colorStart: color,
              colorEnd: colorEnd?.length ? colorEnd[randInt(0, colorEnd.length - 1)] : color,
              speed: [randFloat(speed[0], speed[1])],
            }
          })
          emitted.current += rate
        }
      }
      elapsedTime.current += delta
    })

    const onRestart = useCallback(() => {
      emitted.current = 0
      elapsedTime.current = 0
    }, [])

    const settingsBuilder = useMemo(
      () => (debug ? <VFXBuilderEmitter settings={settings} onChange={setSettings} onRestart={onRestart} /> : null),
      [debug],
    )

    return (
      <>
        {settingsBuilder}
        <object3D {...props} ref={ref} />
      </>
    )
  },
)

export default VFXEmitter

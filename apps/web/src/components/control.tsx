/* eslint-disable react-hooks/rules-of-hooks */
import { useControlStore } from '@/stores/control'
import { TransformControls, useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React, { forwardRef, Suspense, useCallback, useImperativeHandle, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { clamp } from 'three/src/math/MathUtils.js'

const characterStatus = {
  position: new THREE.Vector3(),
  linvel: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
  inputDir: new THREE.Vector3(),
  movingDir: new THREE.Vector3(),
  isOnGround: false,
  isOnMovingPlatform: false,
  animationStatus: 'IDLE',
}

const BVHEcctrl = forwardRef<BVHEcctrlApi, EcctrlProps>(
  (
    {
      children,
      debug = false,
      // Character collider props
      colliderCapsuleArgs = [0.3, 0.6, 4, 8],
      // Physics props
      paused = false,
      delay = 1.5,
      gravity = 9.81,
      fallGravityFactor = 4,
      maxFallSpeed = 50,
      mass = 1,
      sleepTimeout = 10,
      slowMotionFactor = 1,
      // Controller props
      turnSpeed = 15,
      maxWalkSpeed = 3,
      maxRunSpeed = 5,
      acceleration = 26,
      deceleration = 15,
      counterVelFactor = 1.5,
      airDragFactor = 0.3,
      jumpVel = 5,
      maxSlope = 1,
      floatHeight = 0.2,
      floatPullBackHeight = 0.25,
      floatSensorRadius = 0.12,
      floatSpringK = 1600, //320,
      floatDampingC = 60, //24,
      // Collision check props
      collisionCheckIteration = 3,
      // collisionPushBackStrength = 200,
      collisionPushBackVelocity = 3,
      collisionPushBackDamping = 0.1,
      collisionPushBackThreshold = 0.05,
      // Other props
      ...props
    },
    ref,
  ) => {
    /**
     * Initialize setups
     */
    const { camera } = useThree()
    const capsuleRadius = useMemo(() => colliderCapsuleArgs[0], [])
    const capsuleLength = useMemo(() => colliderCapsuleArgs[1], [])
    // Ref for meshes
    // const characterGroupRef = useRef<THREE.Group | null>(null)
    const characterGroupRef = useRef<THREE.Group>(new THREE.Group())
    // const characterGroupRef = ref ?? useRef<THREE.Group | null>(null);
    // const characterGroupRef = (ref as RefObject<THREE.Group>) ?? useRef<THREE.Group | null>(null);
    const characterColliderRef = useRef<THREE.Mesh | null>(null)
    const characterModelRef = useRef<THREE.Group | null>(null)
    // Debug indicators meshes
    const debugBbox = useRef<THREE.Mesh | null>(null)
    const debugLineStart = useRef<THREE.Mesh | null>(null)
    const debugLineEnd = useRef<THREE.Mesh | null>(null)
    const debugRaySensorBbox = useRef<THREE.Mesh | null>(null)
    const debugRaySensorStart = useRef<THREE.Mesh | null>(null)
    const debugRaySensorEnd = useRef<THREE.Mesh | null>(null)
    const contactPointRef = useRef<THREE.Mesh | null>(null)
    const standPointRef = useRef<THREE.Mesh | null>(null)
    const moveDirRef = useRef<THREE.Mesh | null>(null)

    /**
     * Check if inside keyboardcontrols
     */
    function useIsInsideKeyboardControls() {
      try {
        return !!useKeyboardControls()
      } catch {
        return false
      }
    }
    const isInsideKeyboardControls = useIsInsideKeyboardControls()

    const [, getKeys] = isInsideKeyboardControls ? useKeyboardControls() : [null]
    const presetKeys = { forward: false, backward: false, leftward: false, rightward: false, jump: false, run: false }

    /**
     * Physics preset
     */
    // const upAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])
    const upAxis = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0))
    const localUpAxis = useRef<THREE.Vector3>(new THREE.Vector3())
    const gravityDir = useRef<THREE.Vector3>(new THREE.Vector3(0, -1, 0))
    const currentLinVel = useRef<THREE.Vector3>(new THREE.Vector3())
    const currentLinVelOnPlane = useRef<THREE.Vector3>(new THREE.Vector3())
    const isFalling = useRef<boolean>(false)

    /**
     * Sleep character preset
     */
    const idleTime = useRef<number>(0)
    const isSleeping = useRef<boolean>(false)

    /**
     * Follow camera prest
     */
    // const camViewDir = useRef<THREE.Vector3>(new THREE.Vector3())
    const camProjDir = useRef<THREE.Vector3>(new THREE.Vector3())
    const camRightDir = useRef<THREE.Vector3>(new THREE.Vector3())
    // const camRefDir = useRef<THREE.Vector3>(new THREE.Vector3())
    // const crossVec = useRef<THREE.Vector3>(new THREE.Vector3())
    // const constRefDir = useMemo<THREE.Vector3>(() => {
    //     camera.updateMatrixWorld(true);
    //     return camera.getWorldDirection(new THREE.Vector3())
    // }, [])

    /**
     * Controls preset
     */
    const inputDir = useRef<THREE.Vector3>(new THREE.Vector3())
    const inputDirOnPlane = useRef<THREE.Vector3>(new THREE.Vector3())
    const movingDir = useRef<THREE.Vector3>(new THREE.Vector3())
    const deltaLinVel = useRef<THREE.Vector3>(new THREE.Vector3())
    const wantToMoveVel = useRef<THREE.Vector3>(new THREE.Vector3())
    const forwardState = useRef<boolean>(false)
    const backwardState = useRef<boolean>(false)
    const leftwardState = useRef<boolean>(false)
    const rightwardState = useRef<boolean>(false)
    const joystickState = useRef<THREE.Vector2>(new THREE.Vector2())
    const runState = useRef<boolean>(false)
    const jumpState = useRef<boolean>(false)
    const isOnGround = useRef<boolean>(false)
    const prevIsOnGround = useRef<boolean>(false)
    const characterModelTargetQuat = useRef<THREE.Quaternion>(new THREE.Quaternion())
    const characterModelLookMatrix = useRef<THREE.Matrix4>(new THREE.Matrix4())
    const characterOrigin = useMemo(() => new THREE.Vector3(0, 0, 0), [])

    /**
     * Collision preset
     */
    const contactDepth = useRef<number>(0)
    const contactNormal = useRef<THREE.Vector3>(new THREE.Vector3())
    const triContactPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const capsuleContactPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const totalDepth = useRef<number>(0)
    const triangleCount = useRef<number>(0)
    const accumulatedContactNormal = useRef<THREE.Vector3>(new THREE.Vector3())
    const accumulatedContactPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const absorbVel = useRef<THREE.Vector3>(new THREE.Vector3())
    // const pushBackAcc = useRef<THREE.Vector3>(new THREE.Vector3())
    const pushBackVel = useRef<THREE.Vector3>(new THREE.Vector3())
    // Mutable character collision objects
    const characterBbox = useRef<THREE.Box3>(new THREE.Box3())
    const characterBboxSize = useRef<THREE.Vector3>(new THREE.Vector3())
    const characterBboxCenter = useRef<THREE.Vector3>(new THREE.Vector3())
    const characterSegment = useRef<THREE.Line3>(new THREE.Line3())
    const localCharacterBbox = useRef<THREE.Box3>(new THREE.Box3())
    const localCharacterSegment = useRef<THREE.Line3>(new THREE.Line3())
    const collideInvertMatrix = useRef<THREE.Matrix4>(new THREE.Matrix4())
    const relativeCollideVel = useRef<THREE.Vector3>(new THREE.Vector3())
    const relativeContactPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const contactPointRotationalVel = useRef<THREE.Vector3>(new THREE.Vector3())
    const platformVelocityAtContactPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    //
    const instancedContactMatrix = useRef<THREE.Matrix4>(new THREE.Matrix4())
    const contactTempPos = useRef<THREE.Vector3>(new THREE.Vector3())
    const contactTempQuat = useRef<THREE.Quaternion>(new THREE.Quaternion())
    const contactTempScale = useRef<THREE.Vector3>(new THREE.Vector3())
    const scaledContactRadiusVec = useRef<THREE.Vector3>(new THREE.Vector3())
    const deltaDist = useRef<THREE.Vector3>(new THREE.Vector3())

    /**
     * Floating sensor preset
     */
    const currSlopeAngle = useRef<number>(0)
    const isOverMaxSlope = useRef<boolean>(false)
    // const isOverSteepSlope = useRef<boolean>(false)
    const localMinDistance = useRef<number>(Infinity)
    const localClosestPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const localHitNormal = useRef<THREE.Vector3>(new THREE.Vector3())
    const triNormal = useRef<THREE.Vector3>(new THREE.Vector3())
    const globalMinDistance = useRef<number>(Infinity)
    const globalClosestPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const triHitPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const segHitPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const floatHitVec = useRef<THREE.Vector3>(new THREE.Vector3())
    const floatHitNormal = useRef<THREE.Vector3>(new THREE.Vector3())
    const floatHitMesh = useRef<THREE.Mesh | null>(null)
    const groundFriction = useRef<number>(0.8)
    // Mutable float sensor objects
    const floatSensorBbox = useRef<THREE.Box3>(new THREE.Box3())
    const floatSensorBboxSize = useRef<THREE.Vector3>(new THREE.Vector3())
    const floatSensorBboxCenter = useRef<THREE.Vector3>(new THREE.Vector3())
    const floatSensorBboxExpendPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const floatSensorSegment = useRef<THREE.Line3>(new THREE.Line3())
    const localFloatSensorBbox = useRef<THREE.Box3>(new THREE.Box3())
    const localFloatSensorBboxExpendPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const localFloatSensorSegment = useRef<THREE.Line3>(new THREE.Line3())
    const floatInvertMatrix = useRef<THREE.Matrix4>(new THREE.Matrix4())
    const floatNormalInverseMatrix = useRef<THREE.Matrix3>(new THREE.Matrix3())
    const floatNormalMatrix = useRef<THREE.Matrix3>(new THREE.Matrix3())
    // const floatRaycaster = useRef<THREE.Raycaster>(new THREE.Raycaster())
    // floatRaycaster.current.far = floatHeight + floatForgiveness
    const relativeHitPoint = useRef<THREE.Vector3>(new THREE.Vector3())
    const rotationDeltaPos = useRef<THREE.Vector3>(new THREE.Vector3())
    const yawQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion())
    const totalPlatformDeltaPos = useRef<THREE.Vector3>(new THREE.Vector3())
    const isOnMovingPlatform = useRef<boolean>(false)
    //
    const instancedHitMatrix = useRef<THREE.Matrix4>(new THREE.Matrix4())
    const floatTempPos = useRef<THREE.Vector3>(new THREE.Vector3())
    const floatTempQuat = useRef<THREE.Quaternion>(new THREE.Quaternion())
    const floatTempScale = useRef<THREE.Vector3>(new THREE.Vector3())
    const scaledFloatRadiusVec = useRef<THREE.Vector3>(new THREE.Vector3())
    const deltaHit = useRef<THREE.Vector3>(new THREE.Vector3())

    /**
     * Gravity funtion
     */
    const applyGravity = useCallback(
      (delta: number) => {
        gravityDir.current.copy(upAxis.current).negate()
        const fallingSpeed = currentLinVel.current.dot(gravityDir.current)
        isFalling.current = fallingSpeed > 0
        if (fallingSpeed < maxFallSpeed) {
          currentLinVel.current.addScaledVector(gravityDir.current, gravity * (isFalling.current ? fallGravityFactor : 1) * delta)
        }
      },
      [gravity, fallGravityFactor, maxFallSpeed],
    )

    /**
     * Check if need to sleep character function
     */
    const checkCharacterSleep = useCallback((jump: boolean, delta: number) => {
      const moving = currentLinVel.current.lengthSq() > 1e-6
      const platformIsMoving = totalPlatformDeltaPos.current.lengthSq() > 1e-6

      if (!moving && isOnGround.current && !jump && !isOnMovingPlatform.current && !platformIsMoving) {
        idleTime.current += delta
        if (idleTime.current > sleepTimeout) isSleeping.current = true
      } else {
        idleTime.current = 0
        isSleeping.current = false
      }
    }, [])

    /**
     * Get camera azimuthal angle funtion
     */
    // const getAzimuthalAngle = useCallback((camera: THREE.Camera, upAxis: THREE.Vector3): number => {
    //     camera.getWorldDirection(camViewDir.current);
    //     camProjDir.current.copy(camViewDir.current).projectOnPlane(upAxis).normalize();
    //     camRefDir.current.copy(constRefDir).projectOnPlane(upAxis).normalize();
    //     let angle = Math.acos(clamp(camRefDir.current.dot(camProjDir.current), -1, 1));
    //     crossVec.current.crossVectors(camRefDir.current, camProjDir.current);
    //     if (crossVec.current.dot(upAxis) < 0) angle = -angle;
    //     return angle;
    // }, [])

    /**
     * Get input direction function
     * Getting Character moving direction from user inputs
     */
    const setInputDirection = useCallback(
      (dir: { forward?: boolean; backward?: boolean; leftward?: boolean; rightward?: boolean; joystick?: THREE.Vector2 }) => {
        // Reset inputDir.current
        inputDir.current.set(0, 0, 0)

        // Retrieve camera project/right direction
        camera.getWorldDirection(camProjDir.current)
        camProjDir.current.projectOnPlane(upAxis.current).normalize()
        camRightDir.current.crossVectors(camProjDir.current, upAxis.current).normalize()

        // Handle joystick analog input (if available)
        if (dir.joystick && dir.joystick.lengthSq() > 0) {
          inputDir.current.addScaledVector(camProjDir.current, dir.joystick.y).addScaledVector(camRightDir.current, dir.joystick.x)
        } else {
          // Handle digital input
          if (dir.forward) inputDir.current.add(camProjDir.current)
          if (dir.backward) inputDir.current.sub(camProjDir.current)
          if (dir.leftward) inputDir.current.sub(camRightDir.current)
          if (dir.rightward) inputDir.current.add(camRightDir.current)
        }

        inputDir.current.normalize()
      },
      [],
    )
    const handleCharacterMovement = useCallback(
      (runState: boolean, delta: number) => {
        const friction = clamp(groundFriction.current, 0, 1)

        if (inputDir.current.lengthSq() > 0) {
          if (characterModelRef.current) {
            inputDirOnPlane.current.copy(inputDir.current).projectOnPlane(upAxis.current)
            characterModelLookMatrix.current.lookAt(inputDirOnPlane.current, characterOrigin, upAxis.current)
            characterModelTargetQuat.current.setFromRotationMatrix(characterModelLookMatrix.current)
            characterModelRef.current.quaternion.slerp(characterModelTargetQuat.current, delta * turnSpeed)
          }

          const maxSpeed = runState ? maxRunSpeed : maxWalkSpeed
          wantToMoveVel.current.copy(inputDir.current).multiplyScalar(maxSpeed)

          // According to this formula: Δv = a * Δt
          deltaLinVel.current.subVectors(wantToMoveVel.current, currentLinVelOnPlane.current)
          deltaLinVel.current.clampLength(0, acceleration * friction * delta * (isOnGround.current ? 1 : airDragFactor))

          currentLinVel.current.add(deltaLinVel.current)
        } else if (isOnGround.current) {
          deltaLinVel.current.copy(currentLinVelOnPlane.current).clampLength(0, deceleration * friction * delta)
          currentLinVel.current.sub(deltaLinVel.current)
        }
      },
      [acceleration, deceleration, airDragFactor, counterVelFactor, maxRunSpeed, maxWalkSpeed, turnSpeed],
    )

    const updateSegmentBBox = useCallback(() => {
      if (!characterGroupRef.current) return

      characterSegment.current.start.set(0, capsuleLength / 2, 0).add(characterGroupRef.current.position)
      characterSegment.current.end.set(0, -capsuleLength / 2, 0).add(characterGroupRef.current.position)

      characterBbox.current
        .makeEmpty()
        .expandByPoint(characterSegment.current.start)
        .expandByPoint(characterSegment.current.end)
        .expandByScalar(capsuleRadius)

      floatSensorSegment.current.start.copy(characterSegment.current.end)
      floatSensorSegment.current.end.copy(floatSensorSegment.current.start).addScaledVector(gravityDir.current, floatHeight + capsuleRadius)
      floatSensorBboxExpendPoint.current.copy(floatSensorSegment.current.end).addScaledVector(gravityDir.current, floatPullBackHeight)

      floatSensorBbox.current
        .makeEmpty()
        .expandByPoint(floatSensorSegment.current.start)
        .expandByPoint(floatSensorBboxExpendPoint.current)
        .expandByScalar(floatSensorRadius)
    }, [capsuleRadius, capsuleLength, floatHeight, floatPullBackHeight, floatSensorRadius])

    const collisionCheck = useCallback(
      (mesh: THREE.Mesh, originMatrix: THREE.Matrix4, delta: number) => {
        if (!mesh.visible || !mesh.geometry.boundsTree || mesh.userData.excludeCollisionCheck) return

        originMatrix.decompose(contactTempPos.current, contactTempQuat.current, contactTempScale.current)

        collideInvertMatrix.current.copy(originMatrix).invert()

        localCharacterSegment.current.copy(characterSegment.current).applyMatrix4(collideInvertMatrix.current)

        scaledContactRadiusVec.current.set(
          capsuleRadius / contactTempScale.current.x,
          capsuleRadius / contactTempScale.current.y,
          capsuleRadius / contactTempScale.current.z,
        )

        localCharacterBbox.current.makeEmpty().expandByPoint(localCharacterSegment.current.start).expandByPoint(localCharacterSegment.current.end)
        localCharacterBbox.current.min.addScaledVector(scaledContactRadiusVec.current, -1)
        localCharacterBbox.current.max.add(scaledContactRadiusVec.current)

        contactDepth.current = 0
        contactNormal.current.set(0, 0, 0)
        absorbVel.current.set(0, 0, 0)
        pushBackVel.current.set(0, 0, 0)
        platformVelocityAtContactPoint.current.set(0, 0, 0)
        totalDepth.current = 0
        triangleCount.current = 0
        accumulatedContactNormal.current.set(0, 0, 0)
        accumulatedContactPoint.current.set(0, 0, 0)

        mesh.geometry.boundsTree.shapecast({
          intersectsBounds: (box) => box.intersectsBox(localCharacterBbox.current),
          intersectsTriangle: (tri) => {
            tri.closestPointToSegment(localCharacterSegment.current, triContactPoint.current, capsuleContactPoint.current)

            deltaDist.current.copy(triContactPoint.current).sub(capsuleContactPoint.current)

            deltaDist.current.divide(scaledContactRadiusVec.current)

            if (deltaDist.current.lengthSq() < 1) {
              triContactPoint.current.applyMatrix4(originMatrix)
              capsuleContactPoint.current.applyMatrix4(originMatrix)

              contactNormal.current.copy(capsuleContactPoint.current).sub(triContactPoint.current).normalize()
              contactDepth.current = capsuleRadius - capsuleContactPoint.current.distanceTo(triContactPoint.current)

              accumulatedContactNormal.current.addScaledVector(contactNormal.current, contactDepth.current)
              accumulatedContactPoint.current.add(triContactPoint.current)

              totalDepth.current += contactDepth.current
              triangleCount.current += 1
            }
          },
        })

        /**
         * Handle collision event if there is any contact point
         */
        if (triangleCount.current > 0) {
          // Compute average contact point/normal/depth
          accumulatedContactNormal.current.normalize()
          accumulatedContactPoint.current.divideScalar(triangleCount.current)
          const avgDepth = totalDepth.current / triangleCount.current

          /**
           * Compute relative contact velocity on different type of platforms (STATIC/KINEMATIC)
           */
          // if collide with moving platform, calculate relativeVel with platformVelocity
          // otherwise relativeVel is same as the currentLinVel
          if (mesh.userData.type === 'STATIC') {
            relativeCollideVel.current.copy(currentLinVel.current)
          } else if (mesh.userData.type === 'KINEMATIC') {
            // Convert angular velocity to linear velocity at the contact point: linVel = radius x angVel
            // relativeContactPoint is the radius of the rotation, contactPointRotationalVel is converted linear velocity
            relativeContactPoint.current.copy(accumulatedContactPoint.current).sub(mesh.userData.center)
            contactPointRotationalVel.current.crossVectors(mesh.userData.angularVelocity, relativeContactPoint.current)
            // Combine linear & angular velocity to form total platform velocity at the triContactPoint
            platformVelocityAtContactPoint.current.copy(mesh.userData.linearVelocity).add(contactPointRotationalVel.current)
            // Now finally compute relative velocity
            relativeCollideVel.current.copy(currentLinVel.current).sub(platformVelocityAtContactPoint.current)
          }

          const intoSurfaceVel = relativeCollideVel.current.dot(accumulatedContactNormal.current)

          // Absorb velocity based on restitution
          if (intoSurfaceVel < 0) {
            absorbVel.current.copy(accumulatedContactNormal.current).multiplyScalar(-intoSurfaceVel * (1 + mesh.userData.restitution))
            currentLinVel.current.add(absorbVel.current)
          }

          // Apply push-back if contact depth is above threshold
          if (avgDepth > collisionPushBackThreshold) {
            // characterGroupRef.current.position.addScaledVector(accumulatedContactNormal.current,avgDepth)
            const correction = (collisionPushBackDamping / delta) * avgDepth
            pushBackVel.current.copy(accumulatedContactNormal.current).multiplyScalar(correction)
            currentLinVel.current.add(pushBackVel.current)
          }

          /**
           * Debug setup: indicate contact point and direction
           */
          if (debug && contactPointRef.current) {
            // Apply the updated values to contact indicator
            contactPointRef.current.position.copy(accumulatedContactPoint.current)
            contactPointRef.current.lookAt(accumulatedContactNormal.current)
          }
        }
      },
      [capsuleRadius, collisionPushBackThreshold, collisionPushBackDamping, collisionPushBackVelocity, debug],
    )

    /**
     * Handle character collision response function
     */
    const handleCollisionResponse = useCallback(
      (colliderMeshesArray: THREE.Mesh[], delta: number) => {
        // Exit if colliderMeshesArray is not ready
        if (colliderMeshesArray.length === 0) return

        // Check collisions multiple times for better precision
        for (let i = 0; i < collisionCheckIteration; i++) {
          for (const mesh of colliderMeshesArray) {
            if (mesh instanceof THREE.InstancedMesh) {
              for (let i = 0; i < mesh.count; i++) {
                // Extract the instance matrix
                mesh.getMatrixAt(i, instancedContactMatrix.current)
                collisionCheck(mesh, instancedContactMatrix.current, delta)
              }
            } else {
              collisionCheck(mesh, mesh.matrixWorld, delta)
            }
          }
        }
      },
      [collisionCheckIteration, collisionCheck],
    )
    const floatingCheck = useCallback(
      (mesh: THREE.Mesh, originMatrix: THREE.Matrix4) => {
        // Early exit if map is not visible and if map geometry boundsTree is not ready
        if (!mesh.visible || !mesh.geometry.boundsTree || mesh.userData.excludeFloatHit) return

        // Decompose position/quaternion/scale from originMatrix
        originMatrix.decompose(floatTempPos.current, floatTempQuat.current, floatTempScale.current)

        // Invert the collider matrix from world → local space
        floatInvertMatrix.current.copy(originMatrix).invert()
        floatNormalInverseMatrix.current.getNormalMatrix(floatInvertMatrix.current)
        // Get collider matrix normal for later transform local → world space
        floatNormalMatrix.current.getNormalMatrix(originMatrix)

        /**
         * Convert from world mattrix -> local matrix
         */
        // Copy and transform the segment to local space
        localFloatSensorSegment.current.copy(floatSensorSegment.current).applyMatrix4(floatInvertMatrix.current)
        localFloatSensorBboxExpendPoint.current.copy(floatSensorBboxExpendPoint.current).applyMatrix4(floatInvertMatrix.current)

        // Convert sensor radius value to local scaling (number -> vector3) (unitless)
        scaledFloatRadiusVec.current.set(
          floatSensorRadius / floatTempScale.current.x,
          floatSensorRadius / floatTempScale.current.y,
          floatSensorRadius / floatTempScale.current.z,
        )

        // Compute bounding box in local space
        localFloatSensorBbox.current
          .makeEmpty()
          .expandByPoint(localFloatSensorSegment.current.start)
          .expandByPoint(localFloatSensorBboxExpendPoint.current)
        localFloatSensorBbox.current.min.addScaledVector(scaledFloatRadiusVec.current, -1)
        localFloatSensorBbox.current.max.add(scaledFloatRadiusVec.current)

        // Reset float sensor hit point info
        localMinDistance.current = Infinity
        localClosestPoint.current.set(0, 0, 0)

        // Check if floating ray hits any map faces,
        // and find the closest point to sensor start point
        mesh.geometry.boundsTree.shapecast({
          // If not intersects with float sensor bbox, just stop entire shapecast
          intersectsBounds: (box) => box.intersectsBox(localFloatSensorBbox.current),
          // If intersects with float sensor bbox, deeply check collision with float sensor segment
          intersectsTriangle: (tri) => {
            tri.closestPointToSegment(localFloatSensorSegment.current, triHitPoint.current, segHitPoint.current)

            // Compute up axis in local space
            localUpAxis.current.copy(upAxis.current).applyMatrix3(floatNormalInverseMatrix.current).normalize()

            // Calculate the difference vector from segment start to triHitPoint
            deltaHit.current.subVectors(triHitPoint.current, localFloatSensorSegment.current.start)

            // Convert deltaDist to unitless base on scaledRadiusVec,
            // It will be use to determine if there is a collsion happening
            deltaHit.current.divide(scaledFloatRadiusVec.current)

            // Seperate the hit vector to vertical & horizontal length for hit check (along gravity direction)
            // totalLength^2 = vertical^2 + horizontal^2
            const totalLengthSq = deltaHit.current.lengthSq()
            const dot = deltaHit.current.dot(localUpAxis.current)
            // Get vertical length (unitless, scaled by sensor hit length/radius)
            const verticalLength = Math.abs(dot) / ((capsuleRadius + floatHeight + floatPullBackHeight) / floatSensorRadius)
            // Get horizontal length: √(total² - vertical²)
            const horizontalLength = Math.sqrt(Math.max(0, totalLengthSq - dot * dot))

            // const horizontalDistance = deltaHit.current.clone().projectOnPlane(localUpAxis.current);
            // const verticalDistance = deltaHit.current.clone().projectOnVector(localUpAxis.current);
            // verticalDistance.divideScalar((capsuleRadius + floatHeight + floatPullBackHeight) / floatSensorRadius);
            // const horizontalLength = horizontalDistance.length()
            // const verticalLength = verticalDistance.length()

            // Only accept triangle hit if inside sensor range
            if (horizontalLength < 1 && verticalLength < 1) {
              // Local space hit tri normal
              tri.getNormal(triNormal.current)

              /**
               * Convert from local mattrix -> world matrix
               */
              // Transform normal to world space using normalMatrix
              triNormal.current.applyMatrix3(floatNormalMatrix.current).normalize()
              // Transform hit point to world space
              triHitPoint.current.applyMatrix4(originMatrix)

              // Compute the current tri slope angle
              const slopeAngle = triNormal.current.angleTo(upAxis.current)
              // Store the closest and within max slope point
              if (verticalLength < localMinDistance.current && slopeAngle < maxSlope) {
                localMinDistance.current = verticalLength
                localClosestPoint.current.copy(triHitPoint.current)
                localHitNormal.current.copy(triNormal.current)
              }
            }
          },
        })

        /**
         * bvh.shapecast might hit multiple faces,
         * and only the closest one return a valid number,
         * other faces would return infinity.
         * Store only the closest point globalMinDistance/globalClosestPoint
         */
        if (localMinDistance.current < globalMinDistance.current) {
          globalMinDistance.current = localMinDistance.current
          globalClosestPoint.current.copy(localClosestPoint.current)
          floatHitNormal.current.copy(localHitNormal.current)
          currSlopeAngle.current = floatHitNormal.current.angleTo(upAxis.current)
          isOverMaxSlope.current = currSlopeAngle.current > maxSlope
          groundFriction.current = mesh.userData.friction
          floatHitMesh.current = mesh
        }
      },
      [floatSensorRadius, capsuleRadius, floatHeight, floatPullBackHeight, maxSlope],
    )

    /**
     * Handle character floating response function
     * Also check if character is on ground
     */
    const handleFloatingResponse = useCallback(
      (colliderMeshesArray: THREE.Mesh[], jump: boolean, delta: number) => {
        // Exit if colliderMeshesArray is not ready
        if (colliderMeshesArray.length === 0) return

        /**
         * Floating sensor check if character is on ground
         */
        // Reset float sensor hit global info
        globalMinDistance.current = Infinity
        globalClosestPoint.current.set(0, 0, 0)
        for (const mesh of colliderMeshesArray) {
          // Early exit if map is not visible and if map geometry boundsTree is not ready
          // if (!mesh.visible || !mesh.geometry.boundsTree || mesh.userData.excludeFloatHit) continue;

          // Check floating hit for different meshes
          if (mesh instanceof THREE.InstancedMesh) {
            for (let i = 0; i < mesh.count; i++) {
              // Extract the instance matrix
              mesh.getMatrixAt(i, instancedHitMatrix.current)
              floatingCheck(mesh, instancedHitMatrix.current)
            }
          } else {
            floatingCheck(mesh, mesh.matrixWorld)
          }
        }

        // If globalMinDistance.current is valid, sensor hits something.
        // Apply proper floating force to float character
        if (globalMinDistance.current < Infinity) {
          // Check character is on ground and if not over max slope
          if (!isOverMaxSlope.current) {
            isOnGround.current = true
            isFalling.current = false
            // Calculate spring force
            floatHitVec.current.subVectors(floatSensorSegment.current.start, globalClosestPoint.current)
            const springDist = floatHeight + capsuleRadius - floatHitVec.current.dot(upAxis.current)
            const springForce = floatSpringK * springDist
            // Calculate damping force
            const dampingForce = floatDampingC * currentLinVel.current.dot(upAxis.current)
            // Total float force
            const floatForce = springForce - dampingForce
            // Apply force to character's velocity (force * dt / mass)
            if (!jump) currentLinVel.current.addScaledVector(upAxis.current, (floatForce * delta) / mass)
          }
        } else {
          isOnGround.current = false
          currSlopeAngle.current = 0
        }
      },
      [floatingCheck, capsuleRadius, floatHeight, floatSpringK, floatDampingC, mass],
    )

    /**
     * Update character position/rotation with moving platform
     */
    const updateCharacterWithPlatform = useCallback(() => {
      // Exit if characterGroupRef or characterModelRef is not ready
      if (!characterGroupRef.current || !characterModelRef.current) return

      /**
       * Clear platform offset if grounded on static collider
       */
      if (
        isOnGround.current &&
        floatHitMesh.current &&
        floatHitMesh.current.userData.type === 'STATIC' &&
        totalPlatformDeltaPos.current.lengthSq() > 0
      ) {
        totalPlatformDeltaPos.current.set(0, 0, 0)
        return
      }

      /**
       * Apply platform inertia motion when character just left a platform
       */
      if (!isOnGround.current && totalPlatformDeltaPos.current.lengthSq() > 0) {
        characterGroupRef.current.position.add(totalPlatformDeltaPos.current)
      }

      /**
       * Only update when character is on KINEMATIC platform
       */
      if (!isOnGround.current || !floatHitMesh.current || floatHitMesh.current.userData.type !== 'KINEMATIC') {
        isOnMovingPlatform.current = false
        return
      }

      // Retrieve platform information from globle store
      const center = floatHitMesh.current.userData.center as THREE.Vector3
      const deltaPos = floatHitMesh.current.userData.deltaPos as THREE.Vector3
      const deltaQuat = floatHitMesh.current.userData.deltaQuat as THREE.Quaternion
      const rotationAxis = floatHitMesh.current.userData.rotationAxis as THREE.Vector3
      const rotationAngle = floatHitMesh.current.userData.rotationAngle as number
      isOnMovingPlatform.current = true

      /**
       * Update character group linear/rotation position with platform
       */
      // Compute relative position from platform center to hit point before rotation
      relativeHitPoint.current.copy(globalClosestPoint.current).sub(center)
      // Apply rotation to this relative vector and get delta movement due to rotation
      rotationDeltaPos.current.copy(relativeHitPoint.current).applyQuaternion(deltaQuat).sub(relativeHitPoint.current)
      // Combine rotation delta and translation delta pos and apply to character
      totalPlatformDeltaPos.current.copy(rotationDeltaPos.current).add(deltaPos)
      characterGroupRef.current.position.add(totalPlatformDeltaPos.current)

      /**
       * Update character model rotation if platform is rotate along up-axis
       */
      if (rotationAngle > 1e-6) {
        // Check if rotation is primarily around upAxis
        const projection = rotationAxis.dot(upAxis.current)
        if (Math.abs(projection) > 0.9) {
          yawQuaternion.current.setFromAxisAngle(upAxis.current, rotationAngle * projection)
          characterModelRef.current.quaternion.premultiply(yawQuaternion.current)
        }
      }
    }, [])

    /**
     * Update character status for exporting
     */
    const updateCharacterAnimation = useCallback((run: boolean, jump: boolean) => {
      // On ground condition
      if (isOnGround.current) {
        if (!prevIsOnGround.current) {
          return 'JUMP_LAND'
        } else {
          if (inputDir.current.lengthSq() === 0) {
            return 'IDLE'
          } else {
            if (!run) {
              return 'WALK'
            } else {
              return 'RUN'
            }
          }
        }
      }
      // In the air condition
      else {
        if (prevIsOnGround.current && jump) {
          return 'JUMP_START'
        } else {
          if (isFalling.current) {
            return 'JUMP_FALL'
          } else {
            return 'JUMP_IDLE'
          }
        }
      }
    }, [])
    const updateCharacterStatus = useCallback((run: boolean, jump: boolean) => {
      // Control status
      characterModelRef.current?.getWorldPosition(characterStatus.position)
      characterModelRef.current?.getWorldQuaternion(characterStatus.quaternion)
      characterStatus.linvel.copy(currentLinVel.current)
      characterStatus.inputDir.copy(inputDir.current)
      characterStatus.movingDir.copy(movingDir.current)
      characterStatus.isOnGround = isOnGround.current
      characterStatus.isOnMovingPlatform = isOnMovingPlatform.current
      // Animation status
      characterStatus.animationStatus = updateCharacterAnimation(run, jump)
      prevIsOnGround.current = isOnGround.current
    }, [])

    /**
     * Bind controller functions to ref
     */
    const resetLinVel = useCallback(() => currentLinVel.current.set(0, 0, 0), [])
    const setLinVel = useCallback((velocity: THREE.Vector3) => currentLinVel.current.add(velocity), [])
    const setMovement = useCallback((movement: MovementInput) => {
      if (movement.forward !== undefined) forwardState.current = movement.forward
      if (movement.backward !== undefined) backwardState.current = movement.backward
      if (movement.leftward !== undefined) leftwardState.current = movement.leftward
      if (movement.rightward !== undefined) rightwardState.current = movement.rightward
      if (movement.joystick) joystickState.current.copy(movement.joystick)
      if (movement.run !== undefined) runState.current = movement.run
      if (movement.jump !== undefined) jumpState.current = movement.jump
    }, [])
    useImperativeHandle(ref, () => {
      return {
        get group() {
          return characterGroupRef.current
        },
        resetLinVel,
        setLinVel,
        setMovement,
      }
    }, [resetLinVel, setLinVel, setMovement])

    /**
     * Update debug indicators function
     */
    const updateDebugger = useCallback(() => {
      // Get bbox size and center
      characterBbox.current.getSize(characterBboxSize.current)
      characterBbox.current.getCenter(characterBboxCenter.current)

      // Apply the updated values to the bbox mesh
      debugBbox.current?.position.copy(characterBboxCenter.current)
      debugBbox.current?.scale.set(characterBboxSize.current.x, characterBboxSize.current.y, characterBboxSize.current.z)

      // Apply the updated values to character segment start/end
      debugLineStart.current?.position.copy(characterSegment.current.start)
      debugLineEnd.current?.position.copy(characterSegment.current.end)

      // Get floating ray sensor bbox size and center
      floatSensorBbox.current.getSize(floatSensorBboxSize.current)
      floatSensorBbox.current.getCenter(floatSensorBboxCenter.current)

      // Apply the updated values to the floating ray sensor bbox mesh
      debugRaySensorBbox.current?.position.copy(floatSensorBboxCenter.current)
      debugRaySensorBbox.current?.scale.set(floatSensorBboxSize.current.x, floatSensorBboxSize.current.y, floatSensorBboxSize.current.z)

      //  Apply the updated values to floating sensor segment start/end
      debugRaySensorStart.current?.position.copy(floatSensorSegment.current.start)
      debugRaySensorEnd.current?.position.copy(floatSensorSegment.current.end)

      // Update stand point to follow globalClosestPoint
      standPointRef.current?.position.copy(globalClosestPoint.current)

      // Update moving direction indicator to follow character pos and moving dir
      moveDirRef.current?.position.copy(characterGroupRef.current.position).addScaledVector(upAxis.current, 0.7)
      moveDirRef.current?.lookAt(moveDirRef.current?.position.clone().add(camProjDir.current))
      // moveDirRef.current?.lookAt(moveDirRef.current?.position.clone().add(inputDir.current))
    }, [])

    useFrame((state, delta) => {
      /**
       * Global store values
       * Getting all collider array from store
       */
      const colliderMeshesArray = useControlStore.getState().colliderMeshesArray

      /**
       * If paused or delay, skip all the functions
       */
      if (paused || state.clock.elapsedTime < delay) return

      /**
       * Apply slow motion to delta time
       */
      const deltaTime = Math.min(1 / 45, delta) * slowMotionFactor // Fixed smulation at minimum 45 FPS
      // if (delta > 1 / 45) console.warn("Low FPS detected — simulation capped to 45 FPS for stability")

      /**
       * Get camera azimuthal angle
       */
      // const camAngle = getAzimuthalAngle(state.camera, upAxis);

      /**
       * Getting all the useful keys from useKeyboardControls
       */
      // const { forward, backward, leftward, rightward, jump, run } = isInsideKeyboardControls && getKeys ? getKeys() : presetKeys;
      const keys = isInsideKeyboardControls && getKeys ? getKeys() : presetKeys
      const forward = forwardState.current || keys.forward
      const backward = backwardState.current || keys.backward
      const leftward = leftwardState.current || keys.leftward
      const rightward = rightwardState.current || keys.rightward
      const run = runState.current || keys.run
      const jump = jumpState.current || keys.jump

      /**
       * Handle character movement input
       */
      setInputDirection({ forward, backward, leftward, rightward, joystick: joystickState.current })
      // Apply user input to character moving velocity
      handleCharacterMovement(run, deltaTime)
      // Character jump input
      if (jump && isOnGround.current) currentLinVel.current.y = jumpVel
      // Update character moving diretion
      movingDir.current.copy(currentLinVel.current).normalize()
      // Update character current linear velocity on up axis plane
      currentLinVelOnPlane.current.copy(currentLinVel.current).projectOnPlane(upAxis.current)

      /**
       * Check if character is sleeping,
       * If so, pause functions to save performance
       */
      checkCharacterSleep(jump, deltaTime)
      if (!isSleeping.current) {
        /**
         * Apply custom gravity to character current velocity
         */
        if (!isOnGround.current) applyGravity(deltaTime)

        /**
         * Update collider segement/bbox to new position for collision check
         */
        updateSegmentBBox()

        /**
         * Handle character collision response
         * Apply contact normal and contact depth to character current velocity
         */
        handleCollisionResponse(colliderMeshesArray, deltaTime)

        /**
         * Handle character floating response
         */
        handleFloatingResponse(colliderMeshesArray, jump, deltaTime)

        /**
         * Update character position and rotation with moving platform
         */
        updateCharacterWithPlatform()

        /**
         * Apply sum-up velocity to move character position
         */
        if (characterGroupRef.current) characterGroupRef.current.position.addScaledVector(currentLinVel.current, deltaTime)

        /**
         * Update character status for exporting
         */
        updateCharacterStatus(run, jump)
      }

      /**
       * Update debug indicators
       */
      if (debug) updateDebugger()
    })

    return (
      <Suspense fallback={null}>
        <group {...props} ref={characterGroupRef} dispose={null}>
          {/* Character capsule collider */}
          <mesh ref={characterColliderRef} visible={debug}>
            <capsuleGeometry args={colliderCapsuleArgs} />
            <meshNormalMaterial wireframe />
          </mesh>
          {/* Character model */}
          <group name='BVHEcctrl-Model' ref={characterModelRef}>
            {children}
          </group>
        </group>

        {/* Debug helper */}
        {debug && (
          <group>
            <TransformControls object={characterGroupRef} />
            {/* <TransformControls mode="rotate" object={characterGroupRef} scale={2} /> */}
            {/* Character bunding box debugger */}
            <mesh ref={debugBbox}>
              <boxGeometry />
              <meshBasicMaterial color={'yellow'} wireframe />
            </mesh>
            {/* Character segment debugger */}
            <mesh ref={debugLineStart}>
              <octahedronGeometry args={[0.05, 0]} />
              <meshNormalMaterial />
            </mesh>
            <mesh ref={debugLineEnd}>
              <octahedronGeometry args={[0.05, 0]} />
              <meshNormalMaterial />
            </mesh>
            {/* Float ray sensor bunding box debugger */}
            <mesh ref={debugRaySensorBbox}>
              <boxGeometry />
              <meshBasicMaterial color={'yellow'} wireframe />
            </mesh>
            {/* Float ray sensor segment debugger */}
            <mesh ref={debugRaySensorStart}>
              <octahedronGeometry args={[0.1, 0]} />
              <meshBasicMaterial color={'yellow'} wireframe />
            </mesh>
            <mesh ref={debugRaySensorEnd}>
              <octahedronGeometry args={[0.1, 0]} />
              <meshBasicMaterial color={'yellow'} wireframe />
            </mesh>
            {/* Collision contact point debugger */}
            <mesh ref={contactPointRef} scale={[1, 2, 1]}>
              <octahedronGeometry args={[0.1, 0]} />
              <meshNormalMaterial />
            </mesh>
            {/* Character standing point debugger */}
            <mesh ref={standPointRef}>
              <octahedronGeometry args={[0.1, 0]} />
              <meshBasicMaterial color={'red'} />
            </mesh>
            {/* Character input moving direction debugger */}
            <group ref={moveDirRef}>
              <mesh scale={[1, 1, 4]}>
                <octahedronGeometry args={[0.1, 0]} />
                <meshNormalMaterial />
              </mesh>
              <mesh scale={[4, 1, 1]}>
                <octahedronGeometry args={[0.1, 0]} />
                <meshNormalMaterial />
              </mesh>
            </group>
          </group>
        )}
      </Suspense>
    )
  },
)

export default React.memo(BVHEcctrl)

/**
 * Export values/features/functions
 */
export { default as InstancedStaticCollider } from './instanced-static-collider'
export { default as StaticCollider } from './static-collider'
export type { StaticColliderProps } from './static-collider'

/**
 * Export ecctrl types
 */
export interface EcctrlProps extends Omit<React.ComponentProps<'group'>, 'ref'> {
  children?: ReactNode
  debug?: boolean
  colliderCapsuleArgs?: [radius: number, length: number, capSegments: number, radialSegments: number]
  paused?: boolean
  delay?: number
  gravity?: number
  fallGravityFactor?: number
  maxFallSpeed?: number
  mass?: number
  sleepTimeout?: number
  slowMotionFactor?: number
  turnSpeed?: number
  maxWalkSpeed?: number
  maxRunSpeed?: number
  acceleration?: number
  deceleration?: number
  counterVelFactor?: number
  airDragFactor?: number
  jumpVel?: number
  maxSlope?: number
  floatHeight?: number
  floatPullBackHeight?: number
  floatSensorRadius?: number
  floatSpringK?: number
  floatDampingC?: number
  collisionCheckIteration?: number
  // collisionPushBackStrength?: number;
  collisionPushBackVelocity?: number
  collisionPushBackDamping?: number
  collisionPushBackThreshold?: number
}

export type MovementInput = {
  forward?: boolean
  backward?: boolean
  leftward?: boolean
  rightward?: boolean
  joystick?: THREE.Vector2
  run?: boolean
  jump?: boolean
}
export interface BVHEcctrlApi {
  group: THREE.Group
  resetLinVel: () => void
  setLinVel: (v: THREE.Vector3) => void
  setMovement: (input: MovementInput) => void
}

export type CharacterAnimationStatus = 'IDLE' | 'WALK' | 'RUN' | 'JUMP_START' | 'JUMP_IDLE' | 'JUMP_FALL' | 'JUMP_LAND'
export interface CharacterStatus {
  position: THREE.Vector3
  linvel: THREE.Vector3
  quaternion: THREE.Quaternion
  inputDir: THREE.Vector3
  movingDir: THREE.Vector3
  isOnGround: boolean
  isOnMovingPlatform: boolean
  animationStatus: CharacterAnimationStatus
}

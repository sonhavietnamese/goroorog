import type { Vector3 } from 'three'
import type { CharacterAnimationStatus } from './components/control'

export enum SkillType {
  Attack = 'attack',
  Defense = 'defense',
}

export type Arrow = {
  id: string
  name: string
  symbol: 'up' | 'down' | 'left' | 'right'
  texture: string
}

export type Skill = {
  id: string
  type: SkillType
  name: string
  description: string
  combo: Arrow[]
  duration: number
  colors: string[]
  position?: Vector3
  timestamp?: number
}

export enum AppearanceMode {
  Square = 0,
  Circular = 1,
}

export enum RenderMode {
  StretchBillboard = 'stretchBillboard',
  Billboard = 'billboard',
  Mesh = 'mesh',
}

export type EaseFunction =
  | 'easeLinear'

  // Power1
  | 'easeInPower1'
  | 'easeOutPower1'
  | 'easeInOutPower1'

  // Power2
  | 'easeInPower2'
  | 'easeOutPower2'
  | 'easeInOutPower2'

  // Power3
  | 'easeInPower3'
  | 'easeOutPower3'
  | 'easeInOutPower3'

  // Power4
  | 'easeInPower4'
  | 'easeOutPower4'
  | 'easeInOutPower4'

  // Quad
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'

  // Cubic
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'

  // Quart
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'

  // Quint
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'

  // Sine
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'

  // Expo
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'

  // Circ
  | 'easeInCirc'
  | 'easeOutCirc'
  | 'easeInOutCirc'

  // Elastic
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'

  // Back
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'

  // Bounce
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce'

export const easeFunctionList: EaseFunction[] = [
  'easeLinear',
  'easeInPower1',
  'easeOutPower1',
  'easeInOutPower1',
  'easeInPower2',
  'easeOutPower2',
  'easeInOutPower2',
  'easeInPower3',
  'easeOutPower3',
  'easeInOutPower3',
  'easeInPower4',
  'easeOutPower4',
  'easeInOutPower4',
  'easeInQuad',
  'easeOutQuad',
  'easeInOutQuad',
  'easeInCubic',
  'easeOutCubic',
  'easeInOutCubic',
  'easeInQuart',
  'easeOutQuart',
  'easeInOutQuart',
  'easeInQuint',
  'easeOutQuint',
  'easeInOutQuint',
  'easeInSine',
  'easeOutSine',
  'easeInOutSine',
  'easeInExpo',
  'easeOutExpo',
  'easeInOutExpo',
  'easeInCirc',
  'easeOutCirc',
  'easeInOutCirc',
  'easeInElastic',
  'easeOutElastic',
  'easeInOutElastic',
  'easeInBack',
  'easeOutBack',
  'easeInOutBack',
  'easeInBounce',
  'easeOutBounce',
  'easeInOutBounce',
]

export type Player = {
  address: string
  position: [number, number, number]
  quaternion: [number, number, number, number]
  animation: CharacterAnimationStatus
}

import { BN } from '@coral-xyz/anchor'

export const BOSS_STATS = [
  { id: 1, base: new BN(1000000000), level: new BN(1) }, // Health
  { id: 2, base: new BN(1000), level: new BN(1) }, // Damage
  { id: 3, base: new BN(1000), level: new BN(1) }, // Speed
]

export const BOSS_SKILLS = [
  { id: 1, base: new BN(2000), level: new BN(1) }, // Swipe
  { id: 2, base: new BN(5000), level: new BN(1) }, // Jump
  { id: 3, base: new BN(1000), level: new BN(1) }, // Scream
]

export const PLAYER_STATS = [
  { id: 1, base: new BN(1000), level: new BN(1) }, // Health
  { id: 2, base: new BN(100), level: new BN(1) }, // Damage
  { id: 3, base: new BN(10), level: new BN(1) }, // Speed
  { id: 4, base: new BN(100), level: new BN(1) }, // Shield
  { id: 5, base: new BN(10), level: new BN(1) }, // Jump
]

export const PLAYER_SKILLS = [
  { id: 1, base: new BN(1000), level: new BN(1) },
  { id: 2, base: new BN(2000), level: new BN(1) },
  { id: 3, base: new BN(4000), level: new BN(1) },
]

export const RESOURCES = [
  { id: 1, amount: new BN(1) }, // Bit Apple
  { id: 2, amount: new BN(1) }, // Trash Bag
]

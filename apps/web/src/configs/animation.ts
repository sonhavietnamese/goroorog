import type { CharacterAnimationStatus } from '@/components/control'

export type ActionName = 'dance' | 'die' | 'idle' | 'run' | 'walk'

export const ANIMATION_MAP: Partial<Record<CharacterAnimationStatus, ActionName>> = {
  IDLE: 'idle',
  RUN: 'run',
  WALK: 'walk',
}

import { SkillType, type Skill } from '@/types'

export const ARROWS = {
  up: {
    id: 'ArrowUp',
    name: 'Up',
    symbol: '↑',
  },
  down: {
    id: 'ArrowDown',
    name: 'Down',
    symbol: '↓',
  },
  left: {
    id: 'ArrowLeft',
    name: 'Left',
    symbol: '←',
  },
  right: {
    id: 'ArrowRight',
    name: 'Right',
    symbol: '→',
  },
}

export const SKILLS: Skill[] = [
  {
    id: 'atk-001',
    type: SkillType.Attack,
    name: 'Punch',
    description: 'A basic punch',
    combo: [ARROWS.up, ARROWS.up, ARROWS.left, ARROWS.right, ARROWS.down],
  },
  {
    id: 'atk-002',
    type: SkillType.Attack,
    name: 'Kick',
    description: 'A basic kick',
    combo: [ARROWS.down, ARROWS.down, ARROWS.left, ARROWS.right, ARROWS.up],
  },
]

export const MAX_COMBO_LENGTH = 5

import { SkillType, type Skill } from '@/types'
import * as THREE from 'three'

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
    duration: 1000,
    colors: ['#d1beff', 'white'],
    position: new THREE.Vector3(0, 0, 0),
  },
  {
    id: 'atk-002',
    type: SkillType.Attack,
    name: 'Kick',
    description: 'A basic kick',
    combo: [ARROWS.down, ARROWS.down, ARROWS.left, ARROWS.right, ARROWS.up],
    duration: 500,
    colors: ['skyblue', 'white'],
    position: new THREE.Vector3(0, 0, 0),
  },
  {
    id: 'atk-003',
    type: SkillType.Attack,
    name: 'Fireball',
    description: 'A basic fireball',
    combo: [ARROWS.up, ARROWS.down, ARROWS.up, ARROWS.down, ARROWS.right],
    duration: 500,
    colors: ['orange', 'red'],
    position: new THREE.Vector3(0, 0, 0),
  },
]

export const MAX_COMBO_LENGTH = 5

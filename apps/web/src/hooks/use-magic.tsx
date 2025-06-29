import { SKILLS } from '@/configs/skills'
import type { Skill } from '@/types'
import { create } from 'zustand'

interface MagicState {
  isCasting: boolean
  skill: Skill
  skills: Skill[]
  addSkill: (skill: Skill) => void
  setSkill: (skill: Skill) => void
  gameStatus: 'idle' | 'playing' | 'gameover'
  kills: number
  health: number
  lastSpawn: number
  start: () => void
  update: (delta: number) => void
}

export const useMagic = create<MagicState>((set, get) => {
  return {
    castingTimeout: null,
    isCasting: false,
    skill: SKILLS[0],
    setSkill: (skill: Skill) => {
      set(() => ({
        skill,
      }))
    },
    skills: [],
    addSkill: (skill: Skill) => {
      set((state) => {
        return {
          isCasting: true,
          skills: [...state.skills, skill],
        }
      })

      // Cleaning spells
      setTimeout(() => {
        set((state) => ({
          skills: state.skills.filter((skill) => Date.now() - (skill.timestamp ?? 0) < 4000),
        }))
      }, skill.duration + 4000)
    },
    gameStatus: 'idle',
    kills: 0,
    health: 100,
    orcs: [],
    lastSpawn: 0,
    start: () => {
      set(() => ({
        orcs: [],
        gameStatus: 'playing',
        health: 100,
        kills: 0,
      }))
    },
    update: () => {
      if (get().gameStatus !== 'playing') {
        return
      }
      if (get().health <= 0) {
        set(() => ({
          gameStatus: 'gameover',
          orcs: [],
        }))
        return
      }
    },
  }
})

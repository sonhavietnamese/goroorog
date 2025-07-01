import { create } from 'zustand'
import type { SkillAccount, StatAccount } from './player'

interface BossStateStore {
  skills: Record<string, SkillAccount>
  stats: Record<string, StatAccount>
  setSkills: (skills: Record<string, SkillAccount>) => void
  setStats: (stats: Record<string, StatAccount>) => void
}

export const useBoss = create<BossStateStore>((set) => ({
  skills: {},
  stats: {},
  resources: {},
  setSkills: (skills) => set({ skills }),
  setStats: (stats) => set({ stats }),
}))

import { create } from 'zustand'
import type { HistoryAccount, SkillAccount, StatAccount } from './player'

interface BossStateStore {
  skills: Record<string, SkillAccount>
  stats: Record<string, StatAccount>
  history: Record<string, HistoryAccount>
  setSkills: (skills: Record<string, SkillAccount>) => void
  setStats: (stats: Record<string, StatAccount>) => void
  setHistory: (history: Record<string, HistoryAccount>) => void
}

export const useBoss = create<BossStateStore>((set) => ({
  skills: {},
  stats: {},
  history: {},
  setSkills: (skills) => set({ skills }),
  setStats: (stats) => set({ stats }),
  setHistory: (history) => set({ history }),
}))

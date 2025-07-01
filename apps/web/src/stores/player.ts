import type { Goroorog } from '@/idl/goroorog'
import type { IdlAccounts } from '@coral-xyz/anchor'
import { create } from 'zustand'

export type SkillAccount = IdlAccounts<Goroorog>['skills']
export type StatAccount = IdlAccounts<Goroorog>['stats']
export type ResourceAccount = IdlAccounts<Goroorog>['resources']
export type HistoryAccount = IdlAccounts<Goroorog>['history']

interface PlayerStore {
  skills: Record<string, SkillAccount>
  stats: Record<string, StatAccount>
  resources: Record<string, ResourceAccount>
  history: Record<string, HistoryAccount>
  setSkills: (skills: Record<string, SkillAccount>) => void
  setStats: (stats: Record<string, StatAccount>) => void
  setResources: (resources: Record<string, ResourceAccount>) => void
  setHistory: (history: Record<string, HistoryAccount>) => void
}

export const usePlayer = create<PlayerStore>((set) => ({
  skills: {},
  stats: {},
  resources: {},
  history: {},
  setSkills: (skills) => set({ skills }),
  setStats: (stats) => set({ stats }),
  setResources: (resources) => set({ resources }),
  setHistory: (history) => set({ history }),
}))

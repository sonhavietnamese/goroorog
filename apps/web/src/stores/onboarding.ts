import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type Step = 'connect' | 'fund' | 'start'

interface Onboarding {
  step: Step
  setStep: (step: Step) => void
}

export const useOnboarding = create<Onboarding>()(
  persist(
    (set) => ({
      step: 'connect',
      setStep: (step) => set({ step }),
    }),

    { name: 'GOROOROG:ONBOARDING', storage: createJSONStorage(() => localStorage) },
  ),
)

import { create } from 'zustand'

type Step = 'connect' | 'fund' | 'fetch' | 'start'

interface Onboarding {
  step: Step
  setStep: (step: Step) => void
}

// export const useOnboarding = create<Onboarding>()(
//   persist(
//     (set) => ({
//       step: 'connect',
//       setStep: (step) => set({ step }),
//     }),

//     { name: 'GOROOROG:ONBOARDING:dev', storage: createJSONStorage(() => localStorage) },
//   ),
// )

export const useOnboarding = create<Onboarding>()((set) => ({
  step: 'connect',
  setStep: (step) => set({ step }),
}))

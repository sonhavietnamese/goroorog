import { create } from 'zustand'

interface CameraStore {
  shouldShakeCamera: boolean
  setShouldShakeCamera: (shouldShakeCamera: boolean) => void
  startShake: (duration?: number) => void
}

export const useCameraStore = create<CameraStore>((set) => ({
  shouldShakeCamera: false,
  setShouldShakeCamera: (shouldShakeCamera) => set({ shouldShakeCamera }),
  startShake: (duration = 3000) => {
    set({ shouldShakeCamera: true })
    setTimeout(() => {
      set({ shouldShakeCamera: false })
    }, duration)
  },
}))

import { Keypair } from '@solana/web3.js'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface Delegate {
  keypair: {
    publicKey: string
    secretKey: string
  } | null
  generateKeypair: () => void
}

export const useDelegate = create<Delegate>()(
  persist(
    (set) => ({
      keypair: null,
      generateKeypair: () =>
        set(() => {
          const keypair = Keypair.generate()
          return { keypair: { publicKey: keypair.publicKey.toString(), secretKey: keypair.secretKey.toString() } }
        }),
    }),
    {
      name: 'GOROOROG:DELEGATE',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

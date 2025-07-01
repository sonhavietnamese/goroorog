import type { Goroorog } from '@/idl/goroorog'
import idl from '@/idl/goroorog.json'
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'

export const useProgram = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  const provider = useMemo(() => new AnchorProvider(connection, wallet as Wallet, {}), [connection, wallet])

  const program = useMemo(() => new Program<Goroorog>(idl, provider), [provider])

  return program
}

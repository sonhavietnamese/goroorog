import { SEEDS } from '@/configs/seeds'
import { useProgram } from '@/hooks/use-program'
import { parseSecretKey } from '@/libs/utils'
import { useDelegate } from '@/stores/delegate'
import { useOnboarding } from '@/stores/onboarding'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'

export default function PanelFetch() {
  const { program, fetchPlayerData, fetchBossData, createPlayer } = useProgram()
  const { keypair: localKeypair } = useDelegate()
  const { publicKey } = useWallet()
  const { setStep } = useOnboarding()

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey || !localKeypair) return

      await fetchBossData()

      try {
        const payer = parseSecretKey(localKeypair.secretKey)
        const playerPDA = PublicKey.findProgramAddressSync([SEEDS.PLAYERS, publicKey.toBuffer(), payer.publicKey.toBuffer()], program.programId)[0]

        await program.account.players.fetch(playerPDA)
        await fetchPlayerData()

        setStep('start')
      } catch (error) {
        if (error instanceof Error && error.message.includes('Account does not exist')) {
          await createPlayer()
          await fetchPlayerData()

          setStep('start')
          return
        } else {
          console.error(error)
        }
      }
    }

    fetchData()
  }, [program, publicKey, localKeypair])

  return <span className='text-white text-[32px] text-player-panel'>Fetching...</span>
}

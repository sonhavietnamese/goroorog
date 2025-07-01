import { DELEGATE_ACCOUNT_MIN_THRESHOLD } from '@/configs/delegate'
import { useDelegate } from '@/stores/delegate'
import { useOnboarding } from '@/stores/onboarding'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import ButtonConnect from './button-connect'
import PanelDelegate from './panel-delegate'
import PanelFetch from './panel-fetch'

export default function Onboarding() {
  const { connected, publicKey } = useWallet()
  const { keypair, generateKeypair } = useDelegate()
  const { step, setStep } = useOnboarding()
  const { connection } = useConnection()

  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (!keypair || !keypair.publicKey || !keypair.secretKey) {
      generateKeypair()
      return
    }

    if (step === 'start') return

    const checkOnboarding = async () => {
      if (!connected || !publicKey) {
        setStep('connect')
        return
      }

      setIsFetching(true)
      const balance = await connection.getBalance(new PublicKey(keypair.publicKey), 'finalized')

      setIsFetching(false)
      if (balance > DELEGATE_ACCOUNT_MIN_THRESHOLD) {
        setStep('fetch')
        return
      } else {
        setStep('fund')
        return
      }
    }

    checkOnboarding()
  }, [connected, keypair, setStep, step, generateKeypair, connection, publicKey])

  if (isFetching) return <span className='text-white text-[32px] text-player-panel'>Onboarding Fetching...</span>

  if (step === 'connect') return <ButtonConnect />

  if (step === 'fund') return <PanelDelegate />

  if (step === 'fetch') return <PanelFetch />

  if (step === 'start') return null
}

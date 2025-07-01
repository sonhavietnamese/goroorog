import { DELEGATE_ACCOUNT_MIN_THRESHOLD } from '@/configs/delegate'
import { useDelegate } from '@/stores/delegate'
import { useOnboarding } from '@/stores/onboarding'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'
import ButtonConnect from './button-connect'
import PanelDelegate from './panel-delegate'

export default function Onboarding() {
  const { connected, publicKey } = useWallet()
  const { keypair, generateKeypair } = useDelegate()
  const { step, setStep } = useOnboarding()
  const { connection } = useConnection()

  useEffect(() => {
    if (!keypair || !keypair.publicKey || !keypair.secretKey) {
      generateKeypair()
      return
    }

    const checkOnboarding = async () => {
      if (!connected || !publicKey) {
        setStep('connect')
        return
      }

      const balance = await connection.getBalance(new PublicKey(keypair.publicKey))

      if (balance > DELEGATE_ACCOUNT_MIN_THRESHOLD) {
        setStep('start')
        return
      } else {
        setStep('fund')
        return
      }
    }

    checkOnboarding()
  }, [connected, keypair, setStep, step, generateKeypair, connection, publicKey])

  if (step === 'connect') return <ButtonConnect />

  if (step === 'fund') return <PanelDelegate />

  if (step === 'start') return null
}

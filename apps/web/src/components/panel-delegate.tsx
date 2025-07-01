import aButtonFund from '@/assets/elements/button-fund.png'
import aButtonLoading from '@/assets/elements/button-loading.png'
import aPanelDelegate from '@/assets/elements/panel-delegate.png'
import { DELEGATE_ACCOUNT_MIN_THRESHOLD, DELEGATE_ACCOUNT_MINIMUM_FUND_AMOUNT } from '@/configs/delegate'
import { useDelegate } from '@/stores/delegate'
import { useOnboarding } from '@/stores/onboarding'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export default function PanelDelegate() {
  const { keypair } = useDelegate()
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { setStep } = useOnboarding()

  const [isLoading, setIsLoading] = useState(false)

  const handleFund = async () => {
    if (!publicKey || !keypair) return

    setIsLoading(true)

    const transaction = new Transaction()
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(keypair.publicKey),
        lamports: DELEGATE_ACCOUNT_MINIMUM_FUND_AMOUNT,
      }),
    )
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = publicKey

    try {
      const signature = await sendTransaction(transaction, connection)

      const confirmation = await connection.confirmTransaction(signature, 'confirmed')

      if (confirmation.value.err) {
        console.error('❌ Transaction failed:', confirmation.value.err)
      } else {
        console.log('Transaction successful')
      }

      setIsLoading(false)
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      setIsLoading(false)
    }
  }

  // TODO: check balance every 2 seconds
  useEffect(() => {
    const checkBalance = async () => {
      if (!keypair?.publicKey) return

      const balance = await connection.getBalance(new PublicKey(keypair.publicKey))

      if (balance >= DELEGATE_ACCOUNT_MIN_THRESHOLD) {
        setIsLoading(false)
        setStep('start')
      }
    }
    checkBalance()

    const interval = setInterval(checkBalance, 2000)

    return () => clearInterval(interval)
  }, [keypair?.publicKey, connection, setStep])

  return (
    <div className='absolute bottom-40 justify-cenflex flex-col left-1/2 -translate-x-1/2 w-[700px] pointer-events-auto'>
      <img src={aPanelDelegate} draggable={false} className='w-full h-auto' />
      <div className='flex flex-col items-center justify-center'>
        <span className='text-white text-[32px] text-player-panel'>{keypair?.publicKey}</span>

        <button className='hover:rotate-10 active:rotate-0 w-[200px]' onClick={handleFund} disabled={isLoading}>
          {isLoading ? (
            <img src={aButtonLoading} draggable={false} className='w-full' />
          ) : (
            <img src={aButtonFund} draggable={false} className='w-full' />
          )}
        </button>
      </div>
    </div>
  )
}

import connectButton from '@/assets/elements/connect-button.png'
import howtoplay from '@/assets/elements/how-to-play.png'
import type { WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'

export default function ButtonConnect() {
  const { connected, select } = useWallet()

  const handleConnect = () => {
    select('Backpack' as WalletName)
  }

  if (connected) return null

  return (
    <div className='absolute bottom-10 flex items-center flex-col gap-2 left-1/2 -translate-x-1/2 pointer-events-auto'>
      <button className='w-[500px] origin-bottom-left cursor-pointer group hover:mix-blend-difference' onClick={handleConnect}>
        <img
          src={connectButton}
          draggable={false}
          className='w-[500px] group-hover:rotate-[-25deg] group-hover:mix-blend-difference origin-bottom-left'
        />
      </button>
      <img src={howtoplay} draggable={false} className='w-[450px]' />
    </div>
  )
}

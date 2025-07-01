import aPanelPlayer from '@/assets/elements/panel-player.png'
import { formatWalletAddress } from '@/libs/utils'
import { useOnboarding } from '@/stores/onboarding'
import { useWallet } from '@solana/wallet-adapter-react'

export default function PanelPlayer() {
  const { publicKey, connected, disconnect } = useWallet()
  const { step } = useOnboarding()

  if (!connected || step !== 'start') return null

  return (
    <div className='absolute w-[480px] bottom-5 left-1/2 -translate-x-1/2 pointer-events-auto select-none'>
      <div className='w-full flex justify-between px-10 text-[32px] -top-4 leading-none absolute text-white'>
        <div className='flex items-center gap-2'>
          <span className='text-player-panel'>#123</span>
          <span className='text-player-panel'>You</span>
        </div>
        <span className='text-player-panel'>{formatWalletAddress(publicKey?.toBase58() || '')}</span>
      </div>
      <img src={aPanelPlayer} draggable={false} className='w-full' />
      <div className='absolute w-full h-full top-0 left-0 px-8 py-9 pb-11'>
        <div className='w-full h-full bg-[#FFFADA] rounded-full'>
          <div className='w-full h-full bg-[#FCC86E] rounded-full origin-left scale-x-[0.7]'></div>
        </div>
      </div>

      <button className='absolute bottom-0 left-1/2 -translate-x-1/2' onClick={() => disconnect()}>
        <span className='underline text-white text-2xl'>Disconnect</span>
      </button>
    </div>
  )
}

import aPanelPlayer from '@/assets/elements/panel-player.png'
import { useProgram } from '@/hooks/use-program'
import { formatWalletAddress } from '@/libs/utils'
import { useOnboarding } from '@/stores/onboarding'
import { usePlayer } from '@/stores/player'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'

export default function PanelPlayer() {
  const { publicKey, connected, disconnect } = useWallet()
  const { step, setStep } = useOnboarding()
  const { stats } = usePlayer()
  const { getLeaderboard, getPlayerPDA } = useProgram()

  const [rank, setRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchRank = async () => {
      if (!connected) return

      const leaderboard = await getLeaderboard()
      const sorted = Object.values(leaderboard).sort((a, b) => b.value.toNumber() - a.value.toNumber())
      const pda = getPlayerPDA()?.toBase58()

      if (!pda) {
        setRank(null)
        return
      }

      const index = sorted.findIndex((item) => item.from.toBase58() === pda)
      setRank(index === -1 ? null : index + 1)
    }

    fetchRank()
  }, [connected, history])

  if (!connected || step !== 'start') return null
  if (!stats) return null

  const handleDisconnect = async () => {
    await disconnect()
    setStep('start')
  }

  return (
    <div className='absolute w-[480px] bottom-5 left-1/2 -translate-x-1/2 pointer-events-auto select-none'>
      <div className='w-full flex justify-between px-10 text-[32px] -top-4 leading-none absolute text-white'>
        <div className='flex items-center gap-2'>
          <span className='text-player-panel'>{rank !== null ? `#${rank}` : '--'}</span>
          <span className='text-player-panel'>You</span>
        </div>
        <span className='text-player-panel'>{formatWalletAddress(publicKey?.toBase58() || '')}</span>
      </div>
      <img src={aPanelPlayer} draggable={false} className='w-full' />
      <div className='absolute w-full h-full top-0 left-0 px-8 py-0 pb-11'>
        {/* <span className='text-white text-2xl absolute right-10 top-1/2 -translate-y-1/2 text-player-panel'>
          {abbreviateNumber(stats[1].base.toNumber())}
        </span> */}
        {/* <div className='w-full h-full bg-[#FFFADA] rounded-full'>
          <div className='w-full h-full bg-[#FCC86E] rounded-full origin-left scale-x-[0.7]'></div>
        </div> */}
        <button className='absolute bottom-8 left-1/2 -translate-x-1/2' onClick={handleDisconnect}>
          <span className='underline text-white text-2xl'>Disconnect</span>
        </button>
      </div>
    </div>
  )
}

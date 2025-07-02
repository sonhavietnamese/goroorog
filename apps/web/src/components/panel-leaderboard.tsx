import aSampleLeaderboard from '@/assets/elements/panel-leaderboard.png'
import { useProgram } from '@/hooks/use-program'
import { abbreviateNumber, cn, formatWalletAddress } from '@/libs/utils'
import { useBoss } from '@/stores/boss'
import { useOnboarding } from '@/stores/onboarding'
import type { BN } from '@coral-xyz/anchor'
import { useEffect, useState } from 'react'

export default function PanelLeaderboard() {
  const { history } = useBoss()
  const { getPlayerPDA } = useProgram()
  const [leaderboard, setLeaderboard] = useState<{ address: string; value: BN }[]>([])
  const [shouldShowYou, setShouldShowYou] = useState(false)
  const [playerPDA, setPlayerPDA] = useState<string | null>(null)
  const { step } = useOnboarding()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (Object.keys(history).length === 0) return

      const playerPDA = getPlayerPDA()?.toBase58() || null
      const sortedLeaderboard = Object.values(history).sort((a, b) => b.value.toNumber() - a.value.toNumber())

      const topSeven = sortedLeaderboard.slice(0, 7)
      const playerInTopSeven = playerPDA ? topSeven.some((item) => item.from.toBase58() === playerPDA) : false

      setShouldShowYou(!playerInTopSeven)
      setPlayerPDA(playerPDA || null)

      setLeaderboard(
        (playerInTopSeven ? topSeven : sortedLeaderboard.slice(0, 6)).map((item) => ({
          address: item.from.toBase58(),
          value: item.value,
        })),
      )
    }

    fetchLeaderboard()
  }, [history])

  return (
    <div className='absolute top-10 right-5 w-[360px]'>
      <img src={aSampleLeaderboard} draggable={false} className='w-full' />
      <div className='w-full h-full absolute top-0 left-0 pl-16 px-11 py-18'>
        <div className='w-full h-full flex flex-col gap-4'>
          {leaderboard.map((item, index) => {
            const isYou = playerPDA && item.address === playerPDA
            return (
              <div key={index} className='flex justify-between h-[44px] text-[60px]'>
                <span className={cn('text-white text-[24px]', index < 3 && `text-panel-leaderboard-${index}`)}>
                  {isYou ? 'You' : formatWalletAddress(item.address)}
                </span>
                <span className={cn('text-white text-[24px]', index < 3 && `text-panel-leaderboard-${index}`)}>
                  {abbreviateNumber(item.value.toNumber())}
                </span>
              </div>
            )
          })}

          {shouldShowYou && playerPDA && step === 'start' && (
            <div className='flex justify-between h-[44px] text-[60px]'>
              <span className={cn('text-white text-[24px]')}>You</span>
              <span className={cn('text-white text-[24px]')}>{abbreviateNumber(history[1].value.toNumber())}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

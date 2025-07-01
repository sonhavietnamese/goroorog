import aSampleLeaderboard from '@/assets/elements/panel-leaderboard.png'
import { useProgram } from '@/hooks/use-program'
import { abbreviateNumber, cn, formatWalletAddress } from '@/libs/utils'
import { usePlayer } from '@/stores/player'
import type { BN } from '@coral-xyz/anchor'
import { useEffect, useState } from 'react'

export default function PanelLeaderboard() {
  const { history } = usePlayer()
  const { getLeaderboard, getPlayerPDA } = useProgram()
  const [leaderboard, setLeaderboard] = useState<{ address: string; value: BN }[]>([])
  const [shouldShowYou, setShouldShowYou] = useState(false)
  const [playerPDA, setPlayerPDA] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const playerPDA = getPlayerPDA()?.toBase58()
      const leaderboard = await getLeaderboard()
      const sortedLeaderboard = leaderboard.sort((a, b) => b.value.toNumber() - a.value.toNumber())

      // Take the top 7 records to check if the current player is included
      const topSeven = sortedLeaderboard.slice(0, 7)
      const playerInTopSeven = playerPDA ? topSeven.some((item) => item.address === playerPDA) : false

      setShouldShowYou(!playerInTopSeven)
      setPlayerPDA(playerPDA || null)

      // If the player is in the top 7, show all 7; otherwise, show the top 6 and add "You" manually later
      setLeaderboard(playerInTopSeven ? topSeven : sortedLeaderboard.slice(0, 6))
    }

    fetchLeaderboard()
  }, [])

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

          {shouldShowYou && (
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

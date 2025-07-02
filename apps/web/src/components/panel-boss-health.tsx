import aAvatarBoss from '@/assets/elements/avatar-boss.png'
import { abbreviateNumber } from '@/libs/utils'
import { useBoss } from '@/stores/boss'
import { useEffect, useState } from 'react'

export default function PanelBossHealth() {
  const { stats: bossStats, history: bossHistory } = useBoss()
  const [currentBossHealth, setCurrentBossHealth] = useState(0)
  const [currentBossHealthPercentage, setCurrentBossHealthPercentage] = useState(0)

  useEffect(() => {
    if (Object.keys(bossHistory).length === 0 || Object.keys(bossStats).length === 0) return

    const totalValue = Object.values(bossHistory).reduce((acc, curr) => acc + curr.value.toNumber(), 0)
    const currentBossHealth = bossStats[1].base.toNumber() - totalValue
    setCurrentBossHealth(currentBossHealth)
    setCurrentBossHealthPercentage(currentBossHealth / bossStats[1].base.toNumber())
  }, [bossHistory, bossStats, currentBossHealth])

  if (Object.keys(bossStats).length === 0 || Object.keys(bossHistory).length === 0) return null

  return (
    <div className='absolute top-16 left-1/2 -translate-x-1/2 w-[400px] '>
      <img src={aAvatarBoss} draggable={false} className='w-[100px] absolute top-[-40px] z-[1] left-[-85px]' />
      <span className='text-white text-3xl text-boss-panel-name left-5 absolute top-[-20px] z-[1]'>Gorb W/out Bin</span>
      <span className='text-black text-3xl text-boss-panel-round right-5 absolute top-[-20px] z-[1]'>Round 1</span>
      <span className='text-white text-3xl text-boss-panel-health right-5 absolute bottom-[-10px] z-[1]'>
        {abbreviateNumber(currentBossHealth, 6)}/{abbreviateNumber(bossStats[1].base.toNumber())}
      </span>
      <div className='w-full h-[52px] bg-[#FFFADA] rounded-r-[20px] border-[6px] border-[#411877]'>
        <div
          className='w-full h-full bg-[#F2C776] rounded-r-[20px] origin-left'
          style={{ transform: `scaleX(${currentBossHealthPercentage})` }}></div>
      </div>
    </div>
  )
}

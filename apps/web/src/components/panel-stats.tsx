import aBitedApple from '@/assets/icons/bited-apple.png'
import aTrashBag from '@/assets/icons/trash-bag.png'
import { abbreviateNumber } from '@/libs/utils'
import { usePlayer } from '@/stores/player'

export default function PanelStats() {
  const { resources, stats } = usePlayer()

  if (Object.keys(resources).length === 0) return null

  return (
    <div className='absolute bottom-10 right-7 flex flex-col gap-2'>
      <div className='flex gap-2 flex-col'>
        <span className='text-white text-4xl'>Resources</span>
        <div className='flex items-center gap-5'>
          <div className='flex items-center gap-2'>
            <img src={aBitedApple} alt='bited-apple' className='w-10 h-10' />
            <span className='text-white text-2xl'>{abbreviateNumber(resources[1].amount.toNumber())}</span>
          </div>
          <div className='flex items-center gap-2'>
            <img src={aTrashBag} alt='trash-bag' className='w-10 h-10' />
            <span className='text-white text-2xl'>{abbreviateNumber(resources[2].amount.toNumber())}</span>
          </div>
        </div>
      </div>
      <div className='flex gap-2 flex-col items-start w-full'>
        <span className='text-white text-4xl'>Stats</span>
        <div className='flex gap-2 flex-col w-full'>
          <div className='flex items-center gap-2 justify-between'>
            <span className='text-white text-2xl'>DMG:</span>
            <div>
              <span className='text-white text-2xl mr-3'>{abbreviateNumber(stats[2].base.toNumber())}</span>
              <span className='text-white text-2xl p-3 py-1 bg-[#1E00FF] rounded-full'>+</span>
            </div>
          </div>
          <div className='flex items-center gap-2 justify-between'>
            <span className='text-white text-2xl'>Shield:</span>
            <div>
              <span className='text-white text-2xl mr-3'>{abbreviateNumber(stats[4].base.toNumber())}</span>
              <span className='text-white text-2xl p-3 py-1 bg-[#FF0000] rounded-full'>+</span>
            </div>
          </div>
          <div className='flex items-center gap-2 justify-between'>
            <span className='text-white text-2xl'>sPeeD:</span>
            <div>
              <span className='text-white text-2xl mr-3'>{abbreviateNumber(stats[3].base.toNumber())}</span>
              <span className='text-white text-2xl p-3 py-1 bg-[#FF00E5] rounded-full'>+</span>
            </div>
          </div>

          <div className='flex items-center gap-2 justify-between'>
            <span className='text-white text-2xl'>Jump:</span>
            <div>
              <span className='text-white text-2xl mr-3'>{abbreviateNumber(stats[5].base.toNumber())}</span>
              <span className='text-white text-2xl p-3 py-1 bg-[#FF0000] rounded-full'>+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

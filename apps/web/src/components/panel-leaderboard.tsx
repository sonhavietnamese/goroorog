import aSampleLeaderboard from '@/assets/elements/panel-leaderboard.png'
import { cn } from '@/libs/utils'

export default function PanelLeaderboard() {
  return (
    <div className='absolute top-10 right-5 w-[360px]'>
      <img src={aSampleLeaderboard} draggable={false} className='w-full' />
      <div className='w-full h-full absolute top-0 left-0 pl-16 px-11 py-18'>
        <div className='w-full h-full flex flex-col gap-4'>
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className='flex justify-between h-[44px] text-[60px]'>
              <span className={cn('text-white text-[24px]', index < 3 && `text-panel-leaderboard-${index}`)}>7cassg...asdf</span>
              <span className={cn('text-white text-[24px]', index < 3 && `text-panel-leaderboard-${index}`)}>1.2M</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

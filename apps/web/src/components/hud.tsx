import sampleHealthbar from '@/assets/sample-healthbar.png'
import sampleLeaderboard from '@/assets/sample-leaderboard.png'
import samplePanel from '@/assets/sample-panel.png'
import connectButton from '@/assets/elements/connect-button.png'
import howtoplay from '@/assets/elements/how-to-play.png'
import aPanelPlayer from '@/assets/elements/panel-player.png'
import ManagerCommandInput from './manager-command-input'

export default function Hud() {
  return (
    <section className='w-full h-full flex flex-col pointer-events-none items-center justify-center absolute top-0 left-0 z-[1]'>
      <div className='absolute top-5 left-1/2 -translate-x-1/2'>
        <img src={sampleHealthbar} draggable={false} className='w-[600px]' />
      </div>
      <div className='absolute top-10 right-5'>
        <img src={sampleLeaderboard} draggable={false} className='w-[400px]' />
      </div>

      <div className='absolute bottom-10 flex items-center flex-col gap-2 left-1/2 -translate-x-1/2 pointer-events-auto'>
        <button className='w-[500px] origin-bottom-left cursor-pointer group hover:mix-blend-difference'>
          <img
            src={connectButton}
            draggable={false}
            className='w-[500px] group-hover:rotate-[-25deg] group-hover:mix-blend-difference origin-bottom-left'
          />
        </button>
        <img src={howtoplay} draggable={false} className='w-[450px]' />
      </div>

      {/* <div className='absolute bottom-10 left-10'>
        <img src={samplePanel} draggable={false} className='w-[300px]' />
      </div> */}

      {/* <div className='absolute w-[500px] bottom-5 left-1/2 -translate-x-1/2 pointer-events-auto'>
        <div className='w-full flex justify-between px-10 text-[40px] -top-6 leading-none absolute text-white'>
          <div className='flex items-center gap-2'>
            <span className='text-player-panel'>#123</span>
            <span className='text-player-panel'>You</span>
          </div>
          <span className='text-player-panel'>7der2...31234</span>
        </div>
        <img src={aPanelPlayer} draggable={false} className='w-full' />
        <div className='absolute w-full h-full top-0 left-0 px-8 py-9 pb-11'>
          <div className='w-full h-full bg-[#FFFADA] rounded-full'>
            <div className='w-full h-full bg-[#FCC86E] rounded-full origin-left scale-x-[0.7]'></div>
          </div>
        </div>
      </div> */}

      <div className='absolute bottom-10 left-10'></div>
      <ManagerCommandInput />
    </section>
  )
}

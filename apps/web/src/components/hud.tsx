import sampleHealthbar from '@/assets/sample-healthbar.png'
import ButtonConnect from './button-connect'
import ManagerCommandInput from './manager-command-input'
import PanelPlayer from './panel-player'
import PanelLeaderboard from './panel-leaderboard'

export default function Hud() {
  return (
    <section className='w-full h-full flex flex-col pointer-events-none items-center justify-center absolute top-0 left-0 z-[1]'>
      <div className='absolute top-2 left-1/2 -translate-x-1/2'>
        <img src={sampleHealthbar} draggable={false} className='w-[600px]' />
      </div>

      <PanelLeaderboard />

      <ButtonConnect />

      <PanelPlayer />

      {/* <div className='absolute bottom-10 left-10'>
        <img src={samplePanel} draggable={false} className='w-[300px]' />
      </div> */}

      <div className='absolute bottom-10 left-10'></div>
      <ManagerCommandInput />
    </section>
  )
}

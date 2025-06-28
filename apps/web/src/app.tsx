import sampleHealthbar from '@/assets/sample-healthbar.png'
import sampleLeaderboard from '@/assets/sample-leaderboard.png'
import CommandInputManager from '@/components/command-input-manager'
import Game from '@/game'
import { Canvas } from '@react-three/fiber'

export default function App() {
  return (
    <main className='w-dvw h-dvh bg-black'>
      <Hud />
      <Canvas
        shadows
        camera={{
          fov: 25,
          near: 0.1,
          far: 500,
          position: [-30, 20, 30],
        }}>
        <Game />
      </Canvas>
    </main>
  )
}

function Hud() {
  return (
    <section className='w-full h-full flex flex-col pointer-events-none items-center justify-center absolute top-0 left-0 z-[1]'>
      <div className='absolute top-5 left-1/2 -translate-x-1/2'>
        <img src={sampleHealthbar} draggable={false} className='w-[600px]' />
      </div>
      <div className='absolute top-10 right-10'>
        <img src={sampleLeaderboard} draggable={false} className='w-[400px]' />
      </div>

      <CommandInputManager />
    </section>
  )
}

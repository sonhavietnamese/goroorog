import Game from '@/game'
import { Canvas } from '@react-three/fiber'
// import Hud from '@/components/hud'
import { PositionalAudio } from '@react-three/drei'

export default function App() {
  return (
    <main className='w-dvw h-dvh bg-black'>
      {/* <Hud /> */}
      <Canvas
        shadows
        camera={{
          fov: 25,
          near: 0.1,
          far: 500,
          position: [-30, 20, 30],
        }}>
        <Game />
        <Preloader />
      </Canvas>
    </main>
  )
}

const sfxs = ['/sfxs/fire.mp3', '/sfxs/freeze.mp3', '/sfxs/buildup.mp3', '/sfxs/gravity.mp3', '/sfxs/blast.mp3']

const Preloader = () => {
  return (
    <>
      {sfxs.map((url) => (
        <PositionalAudio url={url} autoplay={false} key={url} />
      ))}
    </>
  )
}

import Hud from '@/components/hud'
import ProviderWallet from '@/components/provider-wallet'
import Game from '@/game'
import { PositionalAudio } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import ProviderAuth from './components/provider-auth'

export default function App() {
  return (
    <main className='w-dvw h-dvh bg-black'>
      <ProviderWallet>
        <ProviderAuth>
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
            <Preloader />
          </Canvas>
        </ProviderAuth>
      </ProviderWallet>
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

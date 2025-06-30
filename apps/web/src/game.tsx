import Boss from '@/components/boss'
import Ground from '@/components/ground'
import { ManagerSkill } from '@/components/manager-skill'
import PlayerLocal from '@/components/player-local'
import PlayerRemote from '@/components/player-remote'
import { Bloom, EffectComposer } from '@react-three/postprocessing'

export default function Game() {
  return (
    <>
      <color attach='background' args={['#000000']} />
      {/* <fog attach='fog' args={['#000000', 10, 150]} /> */}

      <ambientLight intensity={2} />

      <Boss />

      <PlayerLocal />
      <PlayerRemote />

      <Ground />

      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>

      <ManagerSkill />
    </>
  )
}

import ManagerCommandInput from './manager-command-input'
import Onboarding from './onboarding'
import PanelBossHealth from './panel-boss-health'
import PanelLeaderboard from './panel-leaderboard'
import PanelPlayer from './panel-player'
import PanelSkillInformation from './panel-skill-information'
import PanelStats from './panel-stats'

export default function Hud() {
  return (
    <section className='w-full h-full flex flex-col pointer-events-none items-center justify-center absolute top-0 left-0 z-[1]'>
      <PanelBossHealth />
      <PanelLeaderboard />

      <Onboarding />

      {/* <ButtonConnect /> */}

      <PanelPlayer />

      <PanelStats />

      <PanelSkillInformation />

      <div className='absolute bottom-10 left-10'></div>
      <ManagerCommandInput />
    </section>
  )
}

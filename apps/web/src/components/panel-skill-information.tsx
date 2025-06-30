import { SKILLS } from '@/configs/skills'

export default function PanelSkillInformation() {
  return (
    <div className='absolute bottom-10 left-7 flex flex-col gap-2'>
      <div className='flex gap-2 flex-col items-start w-full'>
        <span className='text-white text-4xl'>SkillS</span>
        <div className='flex gap-2 flex-col w-full'>
          {SKILLS.map((skill) => (
            <div key={skill.id} className='flex items-center gap-2 justify-between'>
              <span className='text-white text-2xl'>{skill.name}</span>
              <div>
                <div className='flex gap-2'>
                  {skill.combo.map((arrow) => (
                    <img src={arrow.texture} alt={arrow.name} className='w-10 h-10' />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

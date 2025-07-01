import { useMagic } from '@/hooks/use-magic'
import AttackFire from './attack-fire'
import AttackIce from './attack-ice'
import AttackVoid from './attack-void'

export default function Skills() {
  const skills = useMagic((state) => state.skills)

  return skills.map((skill) =>
    skill.id.includes('atk-1') ? (
      <AttackVoid key={skill.id} position={skill.position} />
    ) : skill.id.includes('atk-2') ? (
      <AttackFire key={skill.id} position={skill.position} />
    ) : skill.id.includes('atk-3') ? (
      <AttackIce key={skill.id} position={skill.position} />
    ) : null,
  )
}

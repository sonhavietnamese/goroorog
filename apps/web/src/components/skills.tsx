import { useMagic } from '@/hooks/use-magic'
import AttackFire from './attack-fire'
import AttackIce from './attack-ice'
import AttackVoid from './attack-void'
import * as THREE from 'three'

export default function Skills() {
  const skills = useMagic((state) => state.skills)

  return skills.map((skill) =>
    skill.id.includes('atk-1') ? (
      <AttackVoid key={skill.id} position={new THREE.Vector3(skill.position?.x, skill.position?.y, skill.position?.z)} />
    ) : skill.id.includes('atk-2') ? (
      <AttackFire key={skill.id} position={new THREE.Vector3(skill.position?.x, skill.position?.y, skill.position?.z)} />
    ) : skill.id.includes('atk-3') ? (
      <AttackIce key={skill.id} position={new THREE.Vector3(skill.position?.x, skill.position?.y, skill.position?.z)} />
    ) : null,
  )
}

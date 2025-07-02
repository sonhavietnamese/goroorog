export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function generateResouceId() {
  const resourceIds = ['1', '2']
  return resourceIds[Math.floor(Math.random() * resourceIds.length)]
}

export function generateSkillId() {
  const skillIds = ['1', '2', '3']
  return skillIds[Math.floor(Math.random() * skillIds.length)]
}

export const SKILLS = [
  {
    id: 'atk-1',
    type: 'attack',
    name: 'Trash Flash',
    description: 'A basic punch',
    duration: 1000,
    colors: ['#d1beff', 'white'],
  },
  {
    id: 'atk-2',
    type: 'attack',
    name: 'Fire that shit',
    description: 'A basic kick',
    duration: 500,
    colors: ['skyblue', 'white'],
  },
  {
    id: 'atk-3',
    type: 'attack',
    name: 'am Cool',
    description: 'A basic fireball',
    duration: 500,
    colors: ['orange', 'red'],
  },
]

export function generatePlayerSkill() {
  return SKILLS[Math.floor(Math.random() * SKILLS.length)]
}

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

export enum SkillType {
  Attack = 'attack',
  Defense = 'defense',
}

export type Arrow = {
  id: string
  name: string
  symbol: string
}

export type Skill = {
  id: string
  type: SkillType
  name: string
  description: string
  combo: Arrow[]
}

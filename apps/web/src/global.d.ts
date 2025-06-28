import { ThreeElements } from '@react-three/fiber'

declare global {
  namespace React {
    namespace JSX {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

enum SkillType {
  Attack = 'attack',
  Defense = 'defense',
}

type Arrow = {
  name: string
  symbol: string
}

type Skill = {
  id: string
  type: SkillType
  name: string
  description: string
  combo: Arrow[]
}

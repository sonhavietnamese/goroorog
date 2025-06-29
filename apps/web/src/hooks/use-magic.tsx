import { Vector3 } from 'three'
import { randFloat, randFloatSpread, randInt } from 'three/src/math/MathUtils.js'
import { create } from 'zustand'

export const spells = [
  {
    name: 'void',
    emoji: '🪄',
    duration: 1000,
    colors: ['#d1beff', 'white'],
    position: new Vector3(0, 0, 0),
  },
  {
    name: 'ice',
    emoji: '❄️',
    duration: 500,
    colors: ['skyblue', 'white'],
    position: new Vector3(0, 0, 0),
  },
  {
    name: 'fire',
    emoji: '🔥',
    duration: 500,
    colors: ['orange', 'red'],
    position: new Vector3(0, 0, 0),
  },
]

const generateOrc = (idx: number) => ({
  id: `orc-${idx}`, // Unique ID
  health: 100,
  position: new Vector3(randFloatSpread(-2), 0, randFloat(-15, -20)), // Randomized position
  speed: randFloat(1, 3),
  animation: 'CharacterArmature|Walk',
  lastAttack: 0,
})

interface MagicState {
  isCasting: boolean
  spell: (typeof spells)[number]
  spells: {
    id: string
    name: string
    emoji: string
    duration: number
    colors: string[]
    position: Vector3
    time: number
  }[]
  addSpell: (spell: (typeof spells)[number]) => void
  setSpell: (spell: (typeof spells)[number]) => void
  gameStatus: 'idle' | 'playing' | 'gameover'
  kills: number
  health: number
  orcs: ReturnType<typeof generateOrc>[]
  lastSpawn: number
  start: () => void
  update: (delta: number) => void
}

export const useMagic = create<MagicState>((set, get) => {
  return {
    castingTimeout: null,
    isCasting: false,
    spell: spells[1],
    setSpell: (spell: (typeof spells)[number]) => {
      set(() => ({
        spell,
      }))
    },
    spells: [],
    addSpell: (spell: (typeof spells)[number]) => {
      set((state) => {
        return {
          isCasting: true,
          spells: [
            ...state.spells,
            {
              id: `${Date.now()}-${randInt(0, 100)}-${state.spells.length}`,
              ...spell,
              time: Date.now(),
            },
          ],
        }
      })

      // Handle collision with orcs
      // setTimeout(() => {
      //   get().orcs.forEach((orc: ReturnType<typeof generateOrc>) => {
      //     if (orc.position.distanceTo(spell.position) < 1 && orc.health > 0) {
      //       orc.health -= 40
      //       orc.animation = 'CharacterArmature|HitReact'
      //       orc.lockedUntil = Date.now() + 800
      //       if (orc.health <= 0) {
      //         set((state) => ({
      //           kills: state.kills + 1,
      //         }))
      //         orc.animation = 'CharacterArmature|Death'
      //         orc.health = 0
      //         setTimeout(() => {
      //           orc.position.z = randFloat(-10, -20)
      //           orc.health = 100
      //           orc.animation = 'CharacterArmature|Walk'
      //         }, 1000)
      //       }
      //     }
      //   })
      // }, spell.duration)

      // Cleaning spells
      setTimeout(() => {
        set((state) => ({
          spells: state.spells.filter((spell) => Date.now() - spell.time < 4000),
        }))
      }, spell.duration + 4000)

      // Stop casting
      // castingTimeout = setTimeout(() => {
      //   set(() => ({
      //     isCasting: false,
      //   }))
      // }, spell.duration)
    },
    gameStatus: 'idle',
    kills: 0,
    health: 100,
    orcs: [],
    lastSpawn: 0,
    start: () => {
      set(() => ({
        orcs: [],
        gameStatus: 'playing',
        health: 100,
        kills: 0,
      }))
    },
    update: () => {
      if (get().gameStatus !== 'playing') {
        return
      }
      if (get().health <= 0) {
        set(() => ({
          gameStatus: 'gameover',
          orcs: [],
        }))
        return
      }
      if (get().lastSpawn < Date.now() - 5000 && get().orcs.length < 50) {
        set((state) => ({
          orcs: [...state.orcs, generateOrc(state.orcs.length)],
          lastSpawn: Date.now(),
        }))
      }
    },
  }
})

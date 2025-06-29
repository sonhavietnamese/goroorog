import { ARROWS, MAX_COMBO_LENGTH, SKILLS } from '@/configs/skills'
import { useMagic } from '@/hooks/use-magic'
import { randomInRange } from '@/libs/utils'
import type { Arrow } from '@/types'
import { useEffect, useState } from 'react'
import * as THREE from 'three'

export default function ManagerCommandInput() {
  const [combos, setCombos] = useState<Arrow[]>([])
  // const skills = useMagic((state) => state.skills)
  const addSkill = useMagic((state) => state.addSkill)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if not an arrow key
      if (!Object.values(ARROWS).some((arrow) => arrow.id === event.key)) {
        return
      }

      const arrow = Object.values(ARROWS).find((arrow) => arrow.id === event.key)

      if (arrow) {
        setCombos((prev) => {
          const newCombos = [...prev, arrow]
          return newCombos.length > MAX_COMBO_LENGTH ? newCombos.slice(-MAX_COMBO_LENGTH) : newCombos
        })
      }

      if (event.key === 'Backspace') {
        setCombos([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (combos.length === MAX_COMBO_LENGTH) {
      const validSkill = SKILLS.find((skill) => {
        for (let i = 0; i < combos.length; i++) {
          if (skill.combo[i].id !== combos[i].id) return false
        }
        return true
      })

      if (validSkill) {
        const timestamp = Date.now()

        addSkill({
          ...validSkill,
          id: `${validSkill.id}-${timestamp}`,
          position: new THREE.Vector3(randomInRange(-5, 5), 0, randomInRange(-5, 5)),
          timestamp,
        })
      }

      setCombos([])
    }
  }, [combos])

  return (
    <aside className='absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-2xl flex gap-2'>
      {combos.map((combo) => (
        <div key={`${combo.id}-${Math.random()}`} className='flex aspect-square items-center justify-center gap-2 p-2 bg-black/50 rounded-md'>
          {combo.symbol}
        </div>
      ))}
    </aside>
  )
}

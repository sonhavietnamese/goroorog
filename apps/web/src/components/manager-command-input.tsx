import { ARROWS, MAX_COMBO_LENGTH, SKILLS } from '@/configs/skills'
import { useMagic } from '@/hooks/use-magic'
import { useProgram } from '@/hooks/use-program'
import { database } from '@/libs/firebase'
import { randomInRange } from '@/libs/utils'
import { useAuthStore } from '@/stores/auth'
import type { Arrow, Skill } from '@/types'
import { ref, set } from 'firebase/database'
import { useEffect, useState } from 'react'
import * as THREE from 'three'

export default function ManagerCommandInput() {
  const [combos, setCombos] = useState<Arrow[]>([])
  const addSkill = useMagic((state) => state.addSkill)
  const { updateHistory, getLeaderboard } = useProgram()
  const { user } = useAuthStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        setCombos([])
      }

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
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const handleCombos = async () => {
      if (combos.length === MAX_COMBO_LENGTH) {
        const validSkill = SKILLS.find((skill) => {
          for (let i = 0; i < combos.length; i++) {
            if (skill.combo[i].id !== combos[i].id) return false
          }
          return true
        })

        if (validSkill) {
          const timestamp = Date.now()

          const skill: Skill = {
            ...validSkill,
            id: `${validSkill.id}-${timestamp}`,
            position: new THREE.Vector3(randomInRange(-5, 5), 0, randomInRange(-5, 5)),
            timestamp,
          }

          addSkill(skill)

          await updateHistory()
          set(ref(database, 'skills/' + timestamp), {
            ...validSkill,
            id: `${validSkill.id}-${timestamp}-${user?.uid}`,
            position: new THREE.Vector3(randomInRange(-5, 5), 0, randomInRange(-5, 5)),
            duration: validSkill.duration,
            type: validSkill.type,
            timestamp,
          })
          await getLeaderboard()
        }

        setCombos([])
      }
    }

    handleCombos()
  }, [combos])

  return (
    <aside className='absolute bottom-32 left-1/2 -translate-x-1/2 text-white text-2xl flex gap-2'>
      {combos.map((combo) => (
        <div key={`${combo.id}-${Math.random()}`} className='flex aspect-square items-center justify-center gap-2 p-2 rounded-md'>
          <img src={combo.texture} alt={combo.symbol} className='w-full h-full aspect-square' />
        </div>
      ))}
    </aside>
  )
}

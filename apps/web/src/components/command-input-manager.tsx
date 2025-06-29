import { ARROWS, MAX_COMBO_LENGTH, SKILLS } from '@/configs/skills'
import type { Arrow, Skill } from '@/types'
import { useEffect, useState } from 'react'

export default function CommandInputManager() {
  const [combos, setCombos] = useState<Arrow[]>([])
  const [skill, setSkill] = useState<Skill | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
      const skill = SKILLS.find((skill) => skill.combo.every((arrow) => combos.includes(arrow)))
      if (skill) {
        setSkill(skill)
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

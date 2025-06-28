import { ARROWS, MAX_COMBO_LENGTH } from '@/configs/skills'
import type { Arrow } from '@/types'
import { useEffect, useState } from 'react'

export default function CommandInputManager() {
  const [combos, setCombos] = useState<Arrow[]>([])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

  return (
    <aside className='absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-2xl'>
      <div className='flex gap-2 p-2 bg-black/50 rounded-md'>
        {combos.map((combo) => (
          <div key={`${combo.id}-${Math.random()}`}>{combo.symbol}</div>
        ))}
      </div>
    </aside>
  )
}

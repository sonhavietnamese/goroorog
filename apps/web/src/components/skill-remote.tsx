import { useEffect } from 'react'
import { database } from '@/libs/firebase'
import { onChildAdded, ref } from 'firebase/database'
import { useMagic } from '@/hooks/use-magic'
import { useAuthStore } from '@/stores/auth'

export default function SkillRemote() {
  const addSkill = useMagic((state) => state.addSkill)
  const { user } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onChildAdded(ref(database, 'skills'), (snapshot) => {
      const skill = snapshot.val()

      const [type, , timestamp, uid] = skill.id.split('-')

      if (type === 'atk' && !uid.includes(user?.uid) && Date.now() - timestamp < 5000) {
        addSkill(skill)
      }
    })

    return () => unsubscribe()
  }, [])

  return null
}

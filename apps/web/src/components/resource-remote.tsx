import { database } from '@/libs/firebase'
import { onValue, ref } from 'firebase/database'
import { useEffect, useState } from 'react'
import Resource from './resource'

type Resource = {
  id: string
  createdAt: string
  position: {
    x: number
    y: number
    z: number
  }
}

export default function ResourceRemote() {
  const [resources, setResources] = useState<Record<string, Resource>>({})

  useEffect(() => {
    let unsubscribe: () => void
    const fetchResources = async () => {
      const resourceRef = ref(database, 'resources')
      unsubscribe = onValue(
        resourceRef,
        (snapshot) => {
          const resources = snapshot.val() as Record<string, Resource>
          setResources(resources)
        },
        (error) => {
          console.error(error)
        },
      )
    }

    fetchResources()

    return () => {
      unsubscribe?.()
    }
  }, [])

  return (
    <>
      {Object.entries(resources).map(([id, resource]) => (
        <Resource key={id} id={id} data={resource} />
      ))}
    </>
  )
}

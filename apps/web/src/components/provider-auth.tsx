import { auth } from '@/libs/firebase'
import { useAuthStore } from '@/stores/auth'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { useEffect, useState } from 'react'

interface ProviderAuthProps {
  children: React.ReactNode
}

export default function ProviderAuth({ children }: ProviderAuthProps) {
  const [loading, setLoading] = useState(true)
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        await signInAnonymously(auth)
        onAuthStateChanged(auth, (user) => {
          setUser(user)
          console.log('user', user)
          setLoading(false)
        })
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
    handleSignIn()

    return () => {
      setUser(null)
    }
  }, [])

  return <>{loading ? <div className='text-white text-2xl'>rummaging the trash can...</div> : children}</>
}

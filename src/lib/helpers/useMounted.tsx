import { useState, useEffect } from 'react'

export const useMounted = () => {
  const [mounted, setMounted] = useState<boolean>()
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

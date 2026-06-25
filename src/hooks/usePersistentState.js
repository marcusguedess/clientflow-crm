import { useEffect, useState } from 'react'

export function usePersistentState(key, initialValue, validator = (value) => value) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? validator(JSON.parse(stored), initialValue) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // O app continua funcional mesmo quando o armazenamento está indisponível.
    }
  }, [key, value])

  return [value, setValue]
}

import { useEffect, useState } from 'react'
import { loadLeads, saveLeads } from '../services/crmStorage'

export function useLocalStorage(initialValue) {
  const [value, setValue] = useState(() => loadLeads(initialValue))

  useEffect(() => {
    saveLeads(value)
  }, [value])

  return [value, setValue]
}

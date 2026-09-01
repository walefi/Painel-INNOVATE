import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export function useMonthlyReset(sellers, setSellers, settings, setSettings) {
  const checkAndReset = useCallback(() => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    if (currentDay === settings.monthlyResetDay) {
      const lastReset = settings.lastResetDate ? new Date(settings.lastResetDate) : null
      const alreadyResetThisMonth = lastReset 
        && lastReset.getMonth() === currentMonth 
        && lastReset.getFullYear() === currentYear

      if (!alreadyResetThisMonth) {
        setSellers(prev => prev.map(s => ({
          ...s,
          dailySales: 0,
          monthlySales: 0,
        })))
        setSettings(prev => ({
          ...prev,
          lastResetDate: today.toISOString(),
        }))
      }
    }
  }, [settings.monthlyResetDay, settings.lastResetDate, setSellers, setSettings])

  useEffect(() => {
    checkAndReset()
    const interval = setInterval(checkAndReset, 60000)
    return () => clearInterval(interval)
  }, [checkAndReset])

  return { checkAndReset }
}
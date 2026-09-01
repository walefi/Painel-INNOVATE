import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook para tocar som quando há aumento significativo de vendas
 * Compara o estado atual com o snapshot anterior
 */
export function useAudioAlert(sellers) {
  const prevSnapshotRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/bell.mp3')
    audioRef.current.volume = 0.5
  }, [])

  const checkForAlert = useCallback(() => {
    if (!prevSnapshotRef.current) {
      prevSnapshotRef.current = sellers.map(s => ({
        id: s.id,
        dailySales: s.dailySales,
        monthlySales: s.monthlySales,
      }))
      return false
    }

    let hasSignificantIncrease = false

    const newSnapshot = sellers.map(s => {
      const prev = prevSnapshotRef.current.find(p => p.id === s.id)
      if (prev) {
        const dailyIncrease = s.dailySales - prev.dailySales
        const monthlyIncrease = s.monthlySales - prev.monthlySales
        if (dailyIncrease > s.dailyGoal * 0.1 || monthlyIncrease > s.monthlyGoal * 0.05) {
          hasSignificantIncrease = true
        }
      }
      return { id: s.id, dailySales: s.dailySales, monthlySales: s.monthlySales }
    })

    prevSnapshotRef.current = newSnapshot

    if (hasSignificantIncrease && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }

    return hasSignificantIncrease
  }, [sellers])

  useEffect(() => {
    checkForAlert()
  }, [sellers, checkForAlert])

  return { checkForAlert }
}

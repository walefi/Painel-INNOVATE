import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook para tocar som quando ha aumento significativo de vendas
 * Compara o estado atual com o snapshot anterior
 */
export function useAudioAlert(sellers) {
  const prevSnapshotRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    try {
      audioRef.current = new Audio('/assets/bell.mp3')
      audioRef.current.volume = 0.5
    } catch {
      // Audio nao disponivel (SSR, browser sem suporte, etc.)
    }
  }, [])

  const checkForAlert = useCallback(() => {
    // Protecao contra sellers null/undefined/vazio
    if (!Array.isArray(sellers) || sellers.length === 0) {
      return false
    }

    if (!prevSnapshotRef.current) {
      prevSnapshotRef.current = sellers.map(s => ({
        id: s?.id,
        dailySales: Number(s?.dailySales) || 0,
        monthlySales: Number(s?.monthlySales) || 0,
      }))
      return false
    }

    let hasSignificantIncrease = false

    const newSnapshot = sellers.map(s => {
      const prev = (prevSnapshotRef.current || []).find(p => p?.id === s?.id)
      if (prev) {
        const dailyIncrease = (Number(s?.dailySales) || 0) - (Number(prev?.dailySales) || 0)
        const monthlyIncrease = (Number(s?.monthlySales) || 0) - (Number(prev?.monthlySales) || 0)
        const dailyGoal = Number(s?.dailyGoal) || 0
        const monthlyGoal = Number(s?.monthlyGoal) || 0
        if (
          (dailyGoal > 0 && dailyIncrease > dailyGoal * 0.1) ||
          (monthlyGoal > 0 && monthlyIncrease > monthlyGoal * 0.05)
        ) {
          hasSignificantIncrease = true
        }
      }
      return {
        id: s?.id,
        dailySales: Number(s?.dailySales) || 0,
        monthlySales: Number(s?.monthlySales) || 0,
      }
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

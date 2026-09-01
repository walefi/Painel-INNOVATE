import { useState, useEffect, useCallback } from 'react'

/**
 * Hook para rotação automática de visualizações na TV
 * @param {number} viewCount - Número total de views
 * @param {number} intervalMs - Intervalo entre trocas (default 30000 = 30s)
 */
export function useCarousel(viewCount, intervalMs = 30000) {
  const [currentView, setCurrentView] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToView = useCallback((index) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentView(index)
      setIsTransitioning(false)
    }, 500)
  }, [])

  const nextView = useCallback(() => {
    goToView((currentView + 1) % viewCount)
  }, [currentView, viewCount, goToView])

  useEffect(() => {
    const interval = setInterval(nextView, intervalMs)
    return () => clearInterval(interval)
  }, [nextView, intervalMs])

  return { currentView, isTransitioning, goToView, nextView }
}

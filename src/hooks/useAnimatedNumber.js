import { useState, useEffect, useRef } from 'react'

/**
 * Hook para animar números de 0 até o valor alvo
 * @param {number} targetValue - Valor final
 * @param {number} duration - Duração da animação em ms (default 2000)
 * @param {boolean} enable - Se deve animar (default true)
 */
export function useAnimatedNumber(targetValue, duration = 2000, enable = true) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef(null)
  const frameRef = useRef(null)
  const prevTargetRef = useRef(0)

  useEffect(() => {
    if (!enable) {
      setDisplayValue(targetValue)
      return
    }

    const startValue = prevTargetRef.current
    const diff = targetValue - startValue
    prevTargetRef.current = targetValue

    if (diff === 0) return

    startTimeRef.current = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      
      setDisplayValue(Math.round(startValue + diff * eased))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [targetValue, duration, enable])

  return displayValue
}

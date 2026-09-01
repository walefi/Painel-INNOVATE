import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'

export function ConfettiTrigger({ teamPercentage }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (teamPercentage >= 100 && !hasTriggered) {
      setShowConfetti(true)
      setHasTriggered(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
    if (teamPercentage < 100) {
      setHasTriggered(false)
    }
  }, [teamPercentage, hasTriggered])

  if (!showConfetti) return null

  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={300}
      gravity={0.3}
      colors={['#2DD4BF', '#E8A33D', '#ff8c00', '#22c55e', '#3b82f6', '#a855f7']}
    />
  )
}

import { useState, useEffect } from 'react'

function formatTimeLeft(ms) {
  if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' }
  const totalSeconds = Math.floor(ms / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return { hours, minutes, seconds }
}

export function SprintBanner({ active, prize, endTime }) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!active || !endTime) {
      setExpired(false)
      setTimeLeft(0)
      return
    }

    const remaining = endTime - Date.now()
    if (remaining <= 0) {
      setExpired(true)
      setTimeout(() => setExpired(false), 5000)
      return
    }

    setTimeLeft(remaining)

    const interval = setInterval(() => {
      const left = endTime - Date.now()
      if (left <= 0) {
        clearInterval(interval)
        setTimeLeft(0)
        setExpired(true)
        setTimeout(() => setExpired(false), 5000)
      } else {
        setTimeLeft(left)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [active, endTime])

  if (!active && !expired) return null

  const { hours, minutes, seconds } = formatTimeLeft(timeLeft)

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse-slow">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">⚡</span>
          <span className="text-white font-bold text-xs sm:text-sm md:text-base">
            SPRINT RELAMPAGO: {expired ? 'ENCERRADO!' : prize}
          </span>
        </div>

        {!expired && (
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-white/80 text-xs sm:text-sm">Tempo:</span>
            <span
              className="text-white font-bold text-xl sm:text-2xl md:text-3xl font-space"
              style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}
            >
              {hours}:{minutes}:{seconds}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

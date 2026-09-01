import { useState, useEffect } from 'react'
import { motivationalPhrases } from '../data/initialData'

export function MotivationalFooter() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % motivationalPhrases.length)
        setIsAnimating(false)
      }, 500)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/98 via-slate-900/90 to-transparent py-2.5 sm:py-4 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block bg-slate-800/50 backdrop-blur-sm rounded-full px-4 sm:px-6 py-1.5 sm:py-2 border border-slate-700/50">
          <p
            className={`
              text-xs sm:text-sm md:text-base text-[#2DD4BF] font-medium
              transition-all duration-500 ease-in-out
              ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
            `}
          >
            {motivationalPhrases[currentPhraseIndex]}
          </p>
        </div>
      </div>
    </div>
  )
}
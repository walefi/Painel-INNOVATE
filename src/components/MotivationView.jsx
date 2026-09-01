import { useState, useEffect } from 'react'
import { AnimatedNumber } from './AnimatedNumber'
import { motivationalPhrases } from '../data/initialData'

export function MotivationView({ teamPercentage, teamTotal, teamGoal }) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % motivationalPhrases.length)
        setIsAnimating(false)
      }, 500)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <AnimatedNumber
          value={teamPercentage}
          format="percent"
          className="text-7xl md:text-9xl font-bold text-[#2DD4BF] animate-counter-glow font-space"
          duration={2500}
        />
      </div>

      <div className="w-full max-w-2xl mb-8">
        <div className="w-full bg-slate-800/50 rounded-full overflow-hidden h-4">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              teamPercentage >= 100
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_20px_rgba(74,222,128,0.6)]'
                : teamPercentage >= 80
                ? 'bg-gradient-to-r from-[#2DD4BF] to-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.5)]'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
            style={{ width: `${teamPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-slate-400">
          <span>{formatCurrency(teamTotal)}</span>
          <span>{formatCurrency(teamGoal)}</span>
        </div>
      </div>

      <div className={`
        transition-all duration-500 ease-in-out
        ${isAnimating ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}
      `}>
        <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-4xl font-space">
          {motivationalPhrases[phraseIndex]}
        </p>
      </div>

      <p className="text-slate-400 text-sm md:text-base mt-6">
        Performance da Equipe — Innovate
      </p>
    </div>
  )
}

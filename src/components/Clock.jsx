import { useState, useEffect } from 'react'

export function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = () => {
    const options = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
    return currentTime.toLocaleDateString('pt-BR', options)
  }

  const formatTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 px-3 sm:px-5 py-2 sm:py-3">
      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2DD4BF] font-space tracking-wider">
        {formatTime()}
      </div>
      <div className="text-[10px] sm:text-xs text-slate-300 capitalize mt-1 text-center hidden sm:block">
        {formatDate()}
      </div>
    </div>
  )
}
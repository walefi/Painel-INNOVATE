import { useEffect, useRef } from 'react'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

export function BreakingNewsOverlay({ visible, sellerName, amount }) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (visible && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <audio ref={audioRef} src="/siren.wav" preload="auto" crossOrigin="anonymous" />

      <div className="bg-slate-900/90 rounded-2xl border-2 border-[#E8A33D] p-8 md:p-12 text-center shadow-[0_0_60px_rgba(232,163,61,0.4)] max-w-2xl mx-4 animate-scale-in">
        <p className="text-[#E8A33D] text-4xl md:text-6xl mb-2">🚨</p>
        <p className="text-[#E8A33D] font-bold text-5xl md:text-7xl font-space animate-pulse leading-tight">
          {sellerName || 'Vendedor'}
        </p>
        <p className="text-[#2DD4BF] font-bold text-2xl md:text-4xl mt-4 tracking-wider">
          SUPER VENDA REGISTRADA!
        </p>
        <p className="text-white font-bold text-3xl md:text-5xl mt-3 font-space">
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  )
}

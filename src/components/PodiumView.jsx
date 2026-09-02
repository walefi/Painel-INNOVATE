import { AnimatedNumber } from './AnimatedNumber'
import { Trophy, Medal } from 'lucide-react'

function getInitials(name) {
  if (!name || typeof name !== 'string') return '??'
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '??'
}

function safeNumber(val) {
  return Number(val) || 0
}

export function PodiumView({ sellers = [], period }) {
  const safeSellers = Array.isArray(sellers) ? sellers : []

  const getPeriodSales = (seller) => {
    if (!seller) return 0
    switch (period) {
      case 'daily': return safeNumber(seller.dailySales)
      case 'monthly': return safeNumber(seller.monthlySales)
      case 'annual': return safeNumber(seller.annualSales)
      default: return safeNumber(seller.dailySales)
    }
  }

  const getPeriodGoal = (seller) => {
    if (!seller) return 0
    switch (period) {
      case 'daily': return safeNumber(seller.dailyGoal)
      case 'monthly': return safeNumber(seller.monthlyGoal)
      case 'annual': return safeNumber(seller.annualGoal)
      default: return safeNumber(seller.dailyGoal)
    }
  }

  const sorted = safeSellers
    .filter(s => s && s.name !== 'Representantes')
    .sort((a, b) => getPeriodSales(b) - getPeriodSales(a))
    .slice(0, 3)

  if (sorted.length === 0) return null

  const podiumOrder = sorted.length >= 3 ? [sorted[1], sorted[0], sorted[2]] : sorted
  const podiumHeights = ['h-32', 'h-44', 'h-28']
  const podiumColors = [
    'from-slate-400 to-slate-300',
    'from-[#E8A33D] to-amber-500',
    'from-amber-600 to-amber-700',
  ]
  const positionLabels = ['2o Lugar', '1o Lugar', '3o Lugar']
  const positionFrases = [
    'Incrivel performance!',
    'Cam absoluto! Lenda!',
    'No podio com forca!',
  ]

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-[#2DD4BF] mb-8 animate-slide-up font-space">
        Ranking dos Campeoes
      </h2>

      <div className="flex items-end justify-center gap-4 md:gap-8 max-w-3xl w-full">
        {podiumOrder.map((seller, displayIndex) => {
          if (!seller) return null
          const actualRank = displayIndex === 1 ? 1 : displayIndex === 0 ? 2 : 3
          const sales = getPeriodSales(seller)
          const goal = getPeriodGoal(seller)
          const pct = goal > 0 ? Math.min((sales / goal) * 100, 100) : 0

          const hasPhoto = seller.avatarUrl && typeof seller.avatarUrl === 'string' && seller.avatarUrl.trim() !== ''
          const hasDataAvatar = seller.avatar && typeof seller.avatar === 'string' && seller.avatar.startsWith('data:')
          const initials = getInitials(seller.name)

          return (
            <div
              key={seller.id || displayIndex}
              className="flex flex-col items-center animate-slide-up"
              style={{ animationDelay: `${displayIndex * 200}ms` }}
            >
              <div className="text-center mb-3">
                <div className="relative inline-block mb-2">
                  {hasPhoto ? (
                    <img
                      src={seller.avatarUrl}
                      alt={seller.name || 'Vendedor'}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-3 ${
                        actualRank === 1                         ? 'border-[#E8A33D] shadow-[0_0_20px_rgba(232,163,61,0.5)]' : 'border-slate-600'
                      }`}
                    />
                  ) : hasDataAvatar ? (
                    <img
                      src={seller.avatar}
                      alt={seller.name || 'Vendedor'}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-3 ${
                        actualRank === 1                         ? 'border-[#E8A33D]' : 'border-slate-600'
                      }`}
                    />
                  ) : (
                    <div className={`
                      w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold
                      ${actualRank === 1
                        ? 'bg-[#E8A33D]/20 text-[#E8A33D] border-3 border-[#E8A33D]/50'
                        : 'bg-slate-700/60 text-slate-300 border-3 border-slate-600'
                      }
                    `}>
                      {initials}
                    </div>
                  )}
                  {actualRank === 1 && (
                    <span className="absolute -top-2 -right-2 animate-trophy-bounce">
                      <Trophy className="w-6 h-6 text-[#E8A33D]" />
                    </span>
                  )}
                </div>
                <p className="text-white font-bold text-sm md:text-base truncate max-w-[120px]">{seller.name || 'Sem nome'}</p>
                <p className="text-[#2DD4BF] font-bold font-space text-lg md:text-xl mt-1">
                  <AnimatedNumber value={pct} format="percent" duration={2000} />
                </p>
              </div>

              <div className={`
                ${podiumHeights[displayIndex]} w-28 md:w-36 rounded-t-xl
                bg-gradient-to-b ${podiumColors[displayIndex]}
                flex flex-col items-center justify-start pt-3
                ${actualRank === 1 ? 'animate-podium-glow' : ''}
                shadow-lg
              `}>
                <span className="text-3xl md:text-4xl mb-1">
                  {actualRank === 1 ? <Trophy className="w-8 h-8 text-slate-900" /> : actualRank === 2 ? <Medal className="w-8 h-8 text-white" /> : <Medal className="w-8 h-8 text-white" />}
                </span>
                <span className={`text-xs md:text-sm font-bold ${actualRank === 1 ? 'text-slate-900' : 'text-white'}`}>
                  {positionLabels[displayIndex]}
                </span>
              </div>

              <p className="text-xs md:text-sm text-slate-300 mt-3 text-center max-w-[140px]">
                {positionFrases[displayIndex]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

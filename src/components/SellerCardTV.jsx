import { AnimatedNumber } from './AnimatedNumber'
import { Trophy, Flame } from 'lucide-react'

export function SellerCardTV({ seller, period, rank }) {
  const getPeriodData = () => {
    switch (period) {
      case 'daily':
        return { current: seller.dailySales, goal: seller.dailyGoal, label: 'Meta Diaria' }
      case 'monthly':
        return { current: seller.monthlySales, goal: seller.monthlyGoal, label: 'Meta Mensal' }
      case 'annual':
        return { current: seller.annualSales, goal: seller.annualGoal, label: 'Meta Anual' }
      default:
        return { current: seller.dailySales, goal: seller.dailyGoal, label: 'Meta Diaria' }
    }
  }

  const periodData = getPeriodData()
  const percentage = periodData.goal > 0
    ? Math.min((periodData.current / periodData.goal) * 100, 100)
    : 0

  const isFirst = rank === 1
  const hasStreak = percentage >= 80 && percentage < 100
  const hasTrophy = percentage >= 100

  const hasPhoto = seller.avatarUrl && seller.avatarUrl.trim() !== ''
  const hasDataAvatar = seller.avatar && seller.avatar.startsWith('data:')
  const initials = seller.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div
      className={`
        relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-500
        ${isFirst
          ? 'border-[#2DD4BF]/60 bg-slate-900/60 neon-pulse'
          : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-600/50'
        }
      `}
    >
      <div className={`
        absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10
        ${isFirst
          ? 'bg-[#E8A33D] text-slate-900 shadow-[0_0_15px_rgba(232,163,61,0.5)]'
          : rank <= 3
          ? 'bg-slate-700 text-[#2DD4BF] border border-[#2DD4BF]/50'
          : 'bg-slate-800 text-slate-400 border border-slate-600'
        }
      `}>
        {rank}º
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0">
          {hasPhoto ? (
            <img
              src={seller.avatarUrl}
              alt={seller.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
            />
          ) : hasDataAvatar ? (
            <img
              src={seller.avatar}
              alt={seller.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
            />
          ) : (
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
              ${isFirst
                ? 'bg-[#E8A33D]/20 text-[#E8A33D] border-2 border-[#E8A33D]/50'
                : 'bg-slate-700/60 text-slate-300 border-2 border-slate-600'
              }
            `}>
              {initials}
            </div>
          )}

          {hasStreak && (
            <span className="absolute -bottom-1 -right-1 animate-fire-flicker">
              <Flame className="w-5 h-5 text-orange-500" />
            </span>
          )}
          {hasTrophy && (
            <span className="absolute -bottom-1 -right-1 animate-trophy-bounce">
              <Trophy className="w-5 h-5 text-[#E8A33D]" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{seller.name}</h3>
          <p className="text-slate-400 text-xs">{periodData.label}</p>
        </div>

        <div className={`
          text-xl font-bold font-space
          ${percentage >= 100 ? 'text-green-400' :
            percentage >= 80 ? 'text-[#2DD4BF]' :
            percentage >= 50 ? 'text-[#E8A33D]' :
            'text-slate-300'}
        `}>
          <AnimatedNumber value={percentage} format="percent" duration={1500} />
        </div>
      </div>

      <div className="mb-2">
        <div className="w-full bg-slate-800/50 rounded-full overflow-hidden h-2.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              percentage >= 100
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                : percentage >= 80
                ? 'bg-gradient-to-r from-[#2DD4BF] to-teal-500 shadow-[0_0_8px_rgba(45,212,191,0.4)]'
                : percentage >= 50
                ? 'bg-gradient-to-r from-[#E8A33D] to-amber-400'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs">
        <AnimatedNumber value={periodData.current} format="currency" className="text-slate-300" duration={1500} />
        <span className="text-slate-500">/</span>
        <span className="text-slate-400 font-space">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(periodData.goal)}
        </span>
      </div>

      {seller.badges && seller.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-700/30">
          {seller.badges.map((badge, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] rounded-full bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/30 font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {seller.manualTags && seller.manualTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {seller.manualTags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

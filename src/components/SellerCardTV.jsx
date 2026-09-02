import { AnimatedNumber } from './AnimatedNumber'
import { Trophy, Flame } from 'lucide-react'

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

export function SellerCardTV({ seller = {}, period, rank }) {
  const s = seller || {}

  const getPeriodData = () => {
    switch (period) {
      case 'daily':
        return { current: safeNumber(s.dailySales), goal: safeNumber(s.dailyGoal), label: 'Meta Diaria' }
      case 'monthly':
        return { current: safeNumber(s.monthlySales), goal: safeNumber(s.monthlyGoal), label: 'Meta Mensal' }
      case 'annual':
        return { current: safeNumber(s.annualSales), goal: safeNumber(s.annualGoal), label: 'Meta Anual' }
      default:
        return { current: safeNumber(s.dailySales), goal: safeNumber(s.dailyGoal), label: 'Meta Diaria' }
    }
  }

  const periodData = getPeriodData()
  const percentage = periodData.goal > 0
    ? Math.min((periodData.current / periodData.goal) * 100, 100)
    : 0

  const isFirst = rank === 1
  const hasStreak = percentage >= 80 && percentage < 100
  const hasTrophy = percentage >= 100

  const hasPhoto = s.avatarUrl && typeof s.avatarUrl === 'string' && s.avatarUrl.trim() !== ''
  const hasDataAvatar = s.avatar && typeof s.avatar === 'string' && s.avatar.startsWith('data:')
  const initials = getInitials(s.name)

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
              src={s.avatarUrl}
              alt={s.name || 'Vendedor'}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
            />
          ) : hasDataAvatar ? (
            <img
              src={s.avatar}
              alt={s.name || 'Vendedor'}
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
          <h3 className="text-white font-semibold text-sm truncate">{s.name || 'Sem nome'}</h3>
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
            style={{ width: `${Math.max(0, Math.min(percentage, 100))}%` }}
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

      {Array.isArray(s.badges) && s.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-700/30">
          {s.badges.map((badge, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] rounded-full bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/30 font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {Array.isArray(s.manualTags) && s.manualTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {s.manualTags.map((tag, i) => (
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

export function SellerCard({ seller, period, rank }) {
  const getPeriodData = () => {
    switch (period) {
      case 'daily':
        return { current: seller.dailySales, goal: seller.dailyGoal, label: 'Meta Diária' }
      case 'monthly':
        return { current: seller.monthlySales, goal: seller.monthlyGoal, label: 'Meta Mensal' }
      case 'annual':
        return { current: seller.annualSales, goal: seller.annualGoal, label: 'Meta Anual' }
      default:
        return { current: seller.dailySales, goal: seller.dailyGoal, label: 'Meta Diária' }
    }
  }

  const periodData = getPeriodData()
  const percentage = periodData.goal > 0 
    ? Math.min((periodData.current / periodData.goal) * 100, 100) 
    : 0

  const getProgressIndicator = () => {
    if (percentage >= 100) {
      return { icon: '🏆', message: 'Meta batida!', textColor: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/40' }
    } else if (percentage >= 80) {
      return { icon: '🚀', message: 'Quase lá!', textColor: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/40' }
    } else if (percentage >= 50) {
      return { icon: '🔥', message: 'Bom progresso!', textColor: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' }
    } else {
      return { icon: '💪', message: 'Pode mais!', textColor: 'text-slate-300', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30' }
    }
  }

  const indicator = getProgressIndicator()

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const isCustomAvatar = seller.avatar && seller.avatar.startsWith('data:')

  return (
    <div className={`
      relative p-4 rounded-xl border backdrop-blur-sm
      ${indicator.borderColor} ${indicator.bgColor} bg-slate-900/40
      transition-all duration-300 hover:scale-[1.01]
    `}>
      {rank && (
        <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/50 flex items-center justify-center">
          <span className="text-cyan-400 font-bold text-xs">#{rank}</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        {isCustomAvatar ? (
          <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="text-2xl bg-slate-800/60 w-10 h-10 rounded-lg flex items-center justify-center">
            {seller.avatar}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">{seller.name}</h3>
          <p className="text-slate-400 text-xs">{periodData.label}</p>
        </div>
        <div className={`text-xl ${indicator.textColor}`}>
          {indicator.icon}
        </div>
      </div>

      <div className="mb-2">
        <div className="w-full bg-slate-800/50 rounded-full overflow-hidden h-2.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage >= 100 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                : percentage >= 80
                ? 'bg-gradient-to-r from-cyan-400 to-teal-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                : percentage >= 50
                ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-slate-300">{formatCurrency(periodData.current)}</span>
        <span className={`font-bold ${indicator.textColor}`}>{Math.round(percentage)}%</span>
        <span className="text-slate-400">{formatCurrency(periodData.goal)}</span>
      </div>

      <p className={`text-center text-xs mt-2 py-1 rounded ${indicator.bgColor} ${indicator.textColor} font-medium`}>
        {indicator.message}
      </p>
    </div>
  )
}
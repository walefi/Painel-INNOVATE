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

export function Ranking({ sellers = [], period }) {
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

  const sortedSellers = [...safeSellers].sort((a, b) => {
    return getPeriodSales(b) - getPeriodSales(a)
  })

  const getMotivationalPhrase = (index, total) => {
    if (total === 0) {
      return { text: 'Aguardando dados...', icon: '⏳', color: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-700/50' }
    }
    const position = index + 1
    const percentage = ((total - position) / total) * 100

    if (position === 1) {
      return { text: 'Voando baixo!', icon: '🏆', color: 'text-[#E8A33D]', bg: 'bg-[#E8A33D]/15 border-[#E8A33D]/40' }
    } else if (position === 2) {
      return { text: 'Garçando o topo!', icon: '🥈', color: 'text-slate-200', bg: 'bg-slate-400/10 border-slate-400/30' }
    } else if (position === 3) {
      return { text: 'No pódio!', icon: '🥉', color: 'text-[#E8A33D]', bg: 'bg-[#E8A33D]/10 border-[#E8A33D]/30' }
    } else if (percentage >= 70) {
      return { text: 'Falta pouco!', icon: '🚀', color: 'text-[#2DD4BF]', bg: 'bg-slate-800/50 border-slate-700/50' }
    } else if (percentage >= 40) {
      return { text: 'Acelera!', icon: '🔥', color: 'text-[#E8A33D]', bg: 'bg-slate-800/50 border-slate-700/50' }
    } else {
      return { text: 'Quase lá, acelera!', icon: '💪', color: 'text-slate-300', bg: 'bg-slate-800/50 border-slate-700/50' }
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(safeNumber(value))
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4">
      <h2 className="text-lg font-bold text-[#2DD4BF] mb-3 flex items-center gap-2 font-space">
        <span>📊</span>
        Ranking da Equipe
      </h2>

      <div className="space-y-2">
        {sortedSellers.map((seller, index) => {
          if (!seller) return null
          const phrase = getMotivationalPhrase(index, sortedSellers.length)
          const sales = getPeriodSales(seller)
          const isFirst = index === 0
          const hasPhoto = seller.avatarUrl && typeof seller.avatarUrl === 'string' && seller.avatarUrl.trim() !== ''
          const hasDataAvatar = seller.avatar && typeof seller.avatar === 'string' && seller.avatar.startsWith('data:')
          const initials = getInitials(seller.name)
          
          return (
            <div
              key={seller.id || index}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
                ${phrase.bg}
                ${isFirst ? 'neon-pulse border-[#2DD4BF]/50' : ''}
              `}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                ${isFirst 
                  ? 'bg-[#E8A33D]/25 text-[#E8A33D] border border-[#E8A33D]/40' 
                  : 'bg-slate-700/60 text-slate-300'
                }
              `}>
                {index + 1}º
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {hasPhoto ? (
                    <img src={seller.avatarUrl} alt={seller.name || 'Vendedor'} className="w-6 h-6 rounded-full object-cover" />
                  ) : hasDataAvatar ? (
                    <img src={seller.avatar} alt={seller.name || 'Vendedor'} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-700/60 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {initials}
                    </div>
                  )}
                  <span className="text-white font-medium text-sm">{seller.name || 'Sem nome'}</span>
                </div>
                <p className={`text-xs ${phrase.color}`}>{phrase.text}</p>
              </div>

              <div className="text-right">
                <p className="text-white font-bold text-sm">{formatCurrency(sales)}</p>
                <span className={`text-lg ${phrase.color}`}>{phrase.icon}</span>
              </div>
            </div>
          )
        })}

        {sortedSellers.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">Nenhum vendedor encontrado</p>
        )}
      </div>
    </div>
  )
}

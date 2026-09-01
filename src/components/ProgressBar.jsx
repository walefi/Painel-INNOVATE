/**
 * Componente de Barra de Progresso
 * Exibe o progresso de uma meta com gradiente e indicadores visuais
 * 
 * @param {number} current - Valor atual (vendas realizadas)
 * @param {number} goal - Valor da meta
 * @param {boolean} showPercentage - Se deve mostrar a porcentagem
 * @param {string} size - Tamanho da barra ('sm', 'md', 'lg')
 */
export function ProgressBar({ current, goal, showPercentage = true, size = 'md' }) {
  // Calcula a porcentagem de progresso
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
  
  // Determina o estilo baseado na porcentagem
  const getBarStyle = () => {
    if (percentage >= 100) {
      // Verde brilhante (LED) quando bate 100%
      return 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_20px_rgba(74,222,128,0.6)]'
    } else if (percentage >= 80) {
      // Ciano/teal brilhante quando está perto da meta
      return 'bg-gradient-to-r from-cyan-400 to-teal-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
    } else if (percentage >= 50) {
      // Azul médio
      return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    } else {
      // Azul escuro para valores baixos
      return 'bg-gradient-to-r from-slate-600 to-blue-600'
    }
  }

  // Determina o tamanho da barra
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-2'
      case 'lg': return 'h-6'
      default: return 'h-4'
    }
  }

  // Formata o valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="w-full">
      {/* Barra de progresso */}
      <div className={`w-full bg-slate-800/50 rounded-full overflow-hidden ${getSizeClass()}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarStyle()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Informações abaixo da barra */}
      {showPercentage && (
        <div className="flex justify-between mt-1 text-xs text-slate-300">
          <span>{formatCurrency(current)}</span>
          <span className="font-bold text-cyan-400">{Math.round(percentage)}%</span>
          <span>{formatCurrency(goal)}</span>
        </div>
      )}
    </div>
  )
}
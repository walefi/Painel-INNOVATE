import { AnimatedNumber } from './AnimatedNumber'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.max(0, value || 0))
}

export function PrizeSlide({ prizeName, prizeImage, teamTotal, teamGoal }) {
  const remaining = Math.max(0, (teamGoal || 0) - (teamTotal || 0))
  const reached = remaining <= 0 && teamGoal > 0
  const hasPrize = prizeName && prizeName.trim() !== ''

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-[#2DD4BF] text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2 font-space">
        <span>🎯</span>
        Nosso Premio
      </h2>

      {hasPrize ? (
        <>
          {prizeImage && (
            <div className="mb-6">
              <img
                src={prizeImage}
                alt={prizeName}
                className="max-w-md max-h-64 object-contain rounded-xl border-2 border-[#E8A33D]/50 shadow-[0_0_30px_rgba(232,163,61,0.3)]"
              />
            </div>
          )}

          <p className="text-[#E8A33D] text-3xl md:text-5xl font-bold font-space mb-6">
            {prizeName}
          </p>

          {reached ? (
            <div className="animate-pulse">
              <p className="text-green-400 text-2xl md:text-4xl font-bold font-space mb-2">
                🏆 META BATIDA!
              </p>
              <p className="text-slate-300 text-lg md:text-xl">
                Hora do premio!
              </p>
            </div>
          ) : (
            <div>
              <p className="text-white text-xl md:text-3xl font-space font-bold">
                Faltam{' '}
                <span className="text-[#E8A33D]">{formatCurrency(remaining)}</span>
                {' '}para o nosso{' '}
                <span className="text-[#2DD4BF]">{prizeName}</span>!
              </p>
              <div className="mt-6 w-full max-w-lg mx-auto">
                <div className="w-full bg-slate-800/50 rounded-full overflow-hidden h-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E8A33D] to-amber-400 transition-all duration-1000"
                    style={{ width: `${Math.min(((teamTotal || 0) / (teamGoal || 1)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-slate-400">
                  <span>{formatCurrency(teamTotal)}</span>
                  <span>{formatCurrency(teamGoal)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="text-6xl md:text-8xl mb-6">🏆</p>
          <p className="text-white text-xl md:text-2xl font-space font-bold mb-3">
            Defina o premio da equipe no Painel do Gestor!
          </p>
          <p className="text-slate-400 text-sm md:text-base">
            O premio aparecera aqui para motivar toda a equipe
          </p>
        </div>
      )}
    </div>
  )
}

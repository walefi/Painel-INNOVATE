import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ranking } from '../components/Ranking'
import { Clock } from '../components/Clock'
import { MotivationalFooter } from '../components/MotivationalFooter'
import { SellerCardTV } from '../components/SellerCardTV'
import { ConfettiTrigger } from '../components/ConfettiTrigger'
import { PodiumView } from '../components/PodiumView'
import { MotivationView } from '../components/MotivationView'
import { SalesChart } from '../components/SalesChart'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { useSellers, useTeamGoal, useSettings } from '../hooks/useFirestore'
import { useCarousel } from '../hooks/useCarousel'
import { useAudioAlert } from '../hooks/useAudioAlert'
import { periods } from '../data/initialData'

const backgroundImages = [
  '/assets/background-1.jpg',
  '/assets/background-2.jpg',
]

const ADMIN_PASSWORD = 'admin123'
const VIEW_COUNT = 3

const viewLabels = ['Visao Geral', 'Podium', 'Motivacao']

export function DashboardTV() {
  const { sellers, loading: sellersLoading } = useSellers()
  const { teamGoal, loading: goalLoading } = useTeamGoal()
  const { loading: settingsLoading } = useSettings()
  const [period, setPeriod] = useState('daily')
  const [bgIndex, setBgIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const navigate = useNavigate()
  const menuRef = useRef(null)

  const { currentView, isTransitioning, goToView } = useCarousel(VIEW_COUNT, 30000)
  useAudioAlert(sellers)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % backgroundImages.length)
        setFade(true)
      }, 1000)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      navigate('/admin')
    } else {
      setPasswordError('Senha incorreta')
      setPassword('')
      setTimeout(() => setPasswordError(''), 2000)
    }
  }

  const openPasswordModal = () => {
    setShowMenu(false)
    setShowPasswordModal(true)
    setPassword('')
    setPasswordError('')
  }

  const getTeamTotal = () => {
    return sellers.reduce((total, seller) => {
      switch (period) {
        case 'daily': return total + (seller.dailySales || 0)
        case 'monthly': return total + (seller.monthlySales || 0)
        case 'annual': return total + (seller.annualSales || 0)
        default: return total + (seller.dailySales || 0)
      }
    }, 0)
  }

  const getTeamGoalForPeriod = () => {
    switch (period) {
      case 'daily': return teamGoal.daily || 0
      case 'monthly': return teamGoal.monthly || 0
      case 'annual': return teamGoal.annual || 0
      default: return teamGoal.daily || 0
    }
  }

  const teamTotal = getTeamTotal()
  const teamGoalForPeriod = getTeamGoalForPeriod()
  const teamPercentage = teamGoalForPeriod > 0
    ? Math.min((teamTotal / teamGoalForPeriod) * 100, 100)
    : 0

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const sortedSellers = [...sellers]
    .filter(s => s.name !== 'Representantes')
    .sort((a, b) => {
      const getSales = (s) => {
        switch (period) {
          case 'daily': return s.dailySales || 0
          case 'monthly': return s.monthlySales || 0
          case 'annual': return s.annualSales || 0
          default: return s.dailySales || 0
        }
      }
      return getSales(b) - getSales(a)
    })

  const isLoading = sellersLoading || goalLoading || settingsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#2DD4BF] font-medium">Conectando ao Firestore...</p>
          <p className="text-slate-500 text-sm mt-1">Sincronizando dados em tempo real</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <ConfettiTrigger teamPercentage={teamPercentage} />

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 sm:p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
              <span>🔒</span>
              Acesso Restrito
            </h3>
            <p className="text-slate-400 text-xs mb-4">Digite a senha para acessar o Painel do Gestor</p>
            
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-800 rounded-lg border border-slate-600               focus:border-[#2DD4BF] focus:outline-none text-sm mb-3"
              />
              {passwordError && (
                <p className="text-red-400 text-xs mb-3 text-center animate-pulse">{passwordError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2DD4BF] text-slate-900 rounded-lg hover:bg-[#2DD4BF]/80 transition-colors text-sm font-medium"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="relative min-h-[12rem] sm:min-h-[14rem] md:min-h-[16rem] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${backgroundImages[bgIndex]})`,
            opacity: fade ? 1 : 0,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950" />

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex gap-2">
          {backgroundImages.map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === bgIndex
                  ? 'bg-[#2DD4BF] shadow-[0_0_8px_rgba(45,212,191,0.8)]'
                  : 'bg-slate-500/50'
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 h-full flex items-center justify-between px-3 sm:px-4 md:px-6 py-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2 font-space">
              <span className="text-[#2DD4BF]">🎯</span>
              <span className="truncate">Painel de Metas</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 truncate">Innovate — Representantes Revenda</p>
            
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`
                    px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                    ${period === p.id
                      ? 'bg-[#2DD4BF] text-slate-900 shadow-[0_0_12px_rgba(45,212,191,0.4)]'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50'
                    }
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 ml-3">
            <Clock />
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className={`w-4 sm:w-5 h-0.5 bg-slate-300 transition-all ${showMenu ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <div className={`w-4 sm:w-5 h-0.5 bg-slate-300 transition-all ${showMenu ? 'opacity-0' : ''}`} />
                  <div className={`w-4 sm:w-5 h-0.5 bg-slate-300 transition-all ${showMenu ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-11 sm:top-12 w-44 sm:w-48 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden z-50">
                  <button
                    onClick={openPasswordModal}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
                  >
                    <span>⚙️</span>
                    Painel do Gestor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-24">
        <div className="mb-4 sm:mb-6 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-3 sm:p-4 md:p-5">
          <h2 className="text-base sm:text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
            <span>👥</span>
            Performance da Equipe
          </h2>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
            <div className="text-center">
              <p className="text-slate-400 text-[10px] sm:text-xs">Total de Vendas</p>
              <AnimatedNumber
                value={teamTotal}
                format="currency"
                className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-1 truncate block"
                duration={2000}
              />
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-[10px] sm:text-xs">Meta da Equipe</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#2DD4BF] mt-1 truncate font-space">
                {formatCurrency(teamGoalForPeriod)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-[10px] sm:text-xs">Progresso</p>
              <AnimatedNumber
                value={teamPercentage}
                format="percent"
                className={`text-lg sm:text-xl md:text-2xl font-bold mt-1 block ${
                  teamPercentage >= 100 ? 'text-green-400' :
                  teamPercentage >= 80 ? 'text-[#2DD4BF]' :
                  teamPercentage >= 50 ? 'text-[#E8A33D]' :
                  'text-slate-300'
                }`}
                duration={2000}
              />
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full overflow-hidden h-2 sm:h-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                teamPercentage >= 100 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                  : teamPercentage >= 80
                  ? 'bg-gradient-to-r from-[#2DD4BF] to-teal-500 shadow-[0_0_12px_rgba(45,212,191,0.4)]'
                  : 'bg-gradient-to-r from-blue-500 to-[#2DD4BF]'
              }`}
              style={{ width: `${teamPercentage}%` }}
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          {viewLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => goToView(i)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300
                ${currentView === i
                  ? 'bg-[#2DD4BF] text-slate-900 shadow-[0_0_10px_rgba(45,212,191,0.4)]'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/70 border border-slate-700/50'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={`
          transition-all duration-500 ease-in-out
          ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}
        `}>
          {currentView === 0 && (
            <div className="animate-slide-up">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="lg:col-span-2">
          <h2 className="text-base sm:text-lg font-bold text-[#2DD4BF] mb-3 flex items-center gap-2 font-space">
                    <span>🏆</span>
                    Vendedores
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {sortedSellers.map((seller, index) => (
                      <SellerCardTV
                        key={seller.id}
                        seller={seller}
                        period={period}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                  <div className="mt-4">
                    <SalesChart teamPercentage={teamPercentage} period={period} />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <Ranking sellers={sellers} period={period} />
                </div>
              </div>
            </div>
          )}

          {currentView === 1 && (
            <div className="animate-slide-up">
              <PodiumView sellers={sellers} period={period} />
            </div>
          )}

          {currentView === 2 && (
            <div className="animate-slide-up">
              <MotivationView
                teamPercentage={teamPercentage}
                teamTotal={teamTotal}
                teamGoal={teamGoalForPeriod}
              />
            </div>
          )}
        </div>
      </div>

      <MotivationalFooter />
    </div>
  )
}

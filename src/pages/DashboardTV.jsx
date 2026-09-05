import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
import { OvertakeAlert } from '../components/OvertakeAlert'
import { BreakingNewsOverlay } from '../components/BreakingNewsOverlay'
import { SprintBanner } from '../components/SprintBanner'
import { PrizeSlide } from '../components/PrizeSlide'
import { useSellers, useTeamGoal, useSettings } from '../hooks/useFirestore'
import { useCarousel } from '../hooks/useCarousel'
import { useAudioAlert } from '../hooks/useAudioAlert'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { periods } from '../data/initialData'

const backgroundImages = [
  '/assets/background-1.jpg',
  '/assets/background-2.jpg',
]

const ADMIN_PASSWORD = 'admin123'
const SUPER_SALE_THRESHOLD = 5000

const viewLabelsAll = ['Visao Geral', 'Podium', 'Motivacao', 'Premio']

// ---------- helpers seguros ----------

function safeDivide(numerator, denominator, fallback = 0) {
  if (!denominator || denominator === 0) return fallback
  return numerator / denominator
}

function getPeriodSales(seller, period) {
  if (!seller) return 0
  switch (period) {
    case 'daily': return Number(seller?.dailySales) || 0
    case 'monthly': return Number(seller?.monthlySales) || 0
    case 'annual': return Number(seller?.annualSales) || 0
    default: return Number(seller?.dailySales) || 0
  }
}

function getPeriodGoal(seller, period) {
  if (!seller) return 0
  switch (period) {
    case 'daily': return Number(seller?.dailyGoal) || 0
    case 'monthly': return Number(seller?.monthlyGoal) || 0
    case 'annual': return Number(seller?.annualGoal) || 0
    default: return Number(seller?.dailyGoal) || 0
  }
}

export function DashboardTV() {
  // ---- hooks do Firestore ----
  const { sellers: rawSellers, loading: sellersLoading } = useSellers()
  const { teamGoal: rawTeamGoal, loading: goalLoading } = useTeamGoal()
  const { settings, loading: settingsLoading } = useSettings()

  // ---- estado local ----
  const [period, setPeriod] = useState('daily')
  const [bgIndex, setBgIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const navigate = useNavigate()
  const menuRef = useRef(null)

  // ---- gamification state ----
  const [overtakeAlerts, setOvertakeAlerts] = useState([])
  const [breakingNews, setBreakingNews] = useState({ visible: false, sellerName: '', amount: 0 })

  // ---- dados protegidos contra null/undefined ----
  const sellers = useMemo(() => {
    if (!Array.isArray(rawSellers)) return []
    return rawSellers
  }, [rawSellers])

  const teamGoal = useMemo(() => {
    if (!rawTeamGoal || typeof rawTeamGoal !== 'object') {
      return { daily: 0, monthly: 0, annual: 0 }
    }
    return {
      daily: Number(rawTeamGoal?.daily) || 0,
      monthly: Number(rawTeamGoal?.monthly) || 0,
      annual: Number(rawTeamGoal?.annual) || 0,
    }
  }, [rawTeamGoal])

  // ---- hooks derivados ----
  const showPrize = settings?.showPrize ?? false
  const effectiveViewCount = showPrize ? 4 : 3
  const { currentView: rawCurrentView, isTransitioning, goToView } = useCarousel(effectiveViewCount, 30000)
  
  // Safety: se currentView ficou fora dos limites (ex: showPrize mudou de true para false)
  const currentView = rawCurrentView >= effectiveViewCount ? 0 : rawCurrentView
  useAudioAlert(sellers)

  const handleKeyboardShortcut = useCallback((action) => {
    switch (action) {
      case 'setPeriodDaily':
        setPeriod('daily')
        break
      case 'setPeriodMonthly':
        setPeriod('monthly')
        break
      case 'setPeriodAnnual':
        setPeriod('annual')
        break
      case 'closeModal':
        setShowPasswordModal(false)
        setShowMenu(false)
        break
      case 'showHelp':
        alert(
          'Atalhos de Teclado:\n\n' +
          'D - Periodo Diario\n' +
          'M - Periodo Mensal\n' +
          'A - Periodo Anual\n' +
          'ESC - Fechar modal/menu\n' +
          '? - Mostrar esta ajuda'
        )
        break
      default:
        break
    }
  }, [])

  useKeyboardShortcuts({
    'd': () => handleKeyboardShortcut('setPeriodDaily'),
    'm': () => handleKeyboardShortcut('setPeriodMonthly'),
    'a': () => handleKeyboardShortcut('setPeriodAnnual'),
    'escape': () => handleKeyboardShortcut('closeModal'),
    '?': () => handleKeyboardShortcut('showHelp'),
  })

  // ---- calculos derivados ----
  const teamTotal = useMemo(() => {
    return (sellers || []).reduce((total, seller) => {
      return total + getPeriodSales(seller, period)
    }, 0)
  }, [sellers, period])

  const teamGoalForPeriod = useMemo(() => {
    switch (period) {
      case 'daily': return Number(teamGoal?.daily) || 0
      case 'monthly': return Number(teamGoal?.monthly) || 0
      case 'annual': return Number(teamGoal?.annual) || 0
      default: return Number(teamGoal?.daily) || 0
    }
  }, [teamGoal, period])

  const teamPercentage = useMemo(() => {
    return teamGoalForPeriod > 0
      ? Math.min(safeDivide(teamTotal, teamGoalForPeriod) * 100, 100)
      : 0
  }, [teamTotal, teamGoalForPeriod])

  const sortedSellers = useMemo(() => {
    return (sellers || [])
      .filter((s) => s?.name !== 'Representantes')
      .sort((a, b) => getPeriodSales(b, period) - getPeriodSales(a, period))
  }, [sellers, period])

  // ---- sprint settings ----
  const sprintActive = settings?.sprintActive && settings?.sprintEnd && settings.sprintEnd > Date.now()
  const sprintPrize = settings?.sprintPrize || ''
  const sprintEndTime = settings?.sprintEnd || null
  const mainPrizeName = settings?.mainPrizeName || ''
  const mainPrizeImage = settings?.mainPrizeImage || ''

  // ---- overtake detection ----
  const prevSortedSellersRef = useRef(null)
  const hasInitialSnapshot = useRef(false)

  useEffect(() => {
    if (!sortedSellers || sortedSellers.length === 0) return

    if (!hasInitialSnapshot.current) {
      prevSortedSellersRef.current = sortedSellers
      hasInitialSnapshot.current = true
      return
    }

    const prevSorted = prevSortedSellersRef.current
    if (!prevSorted || prevSorted.length === 0) return

    const prevRankMap = {}
    prevSorted.forEach((s, idx) => {
      if (s?.id) prevRankMap[s.id] = idx
    })

    const newAlerts = []

    sortedSellers.forEach((seller, newIdx) => {
      if (!seller?.id) return
      const prevIdx = prevRankMap[seller.id]
      if (prevIdx !== undefined && prevIdx > newIdx) {
        const overtakenSeller = prevSorted[prevIdx]
        if (overtakenSeller?.name && seller?.name && overtakenSeller.id !== seller.id) {
          newAlerts.push({
            id: `overtake_${seller.id}_${Date.now()}_${Math.random()}`,
            text: `🔥 ${seller.name} ligou o turbo e ultrapassou ${overtakenSeller.name}!`,
            timestamp: Date.now(),
          })
        }
      }
    })

    prevSortedSellersRef.current = sortedSellers

    if (newAlerts.length > 0) {
      setOvertakeAlerts((prev) => [...prev, ...newAlerts])
    }
  }, [sortedSellers])

  // ---- breaking news detection ----
  const prevSellersForBreakingRef = useRef(null)
  const hasInitialSellersSnapshot = useRef(false)

  useEffect(() => {
    if (!sellers || sellers.length === 0) return

    if (!hasInitialSellersSnapshot.current) {
      prevSellersForBreakingRef.current = sellers
      hasInitialSellersSnapshot.current = true
      return
    }

    const prevSellers = prevSellersForBreakingRef.current
    if (!prevSellers) return

    for (const seller of sellers) {
      if (!seller?.id || !seller?.name) continue
      const prevSeller = prevSellers.find((p) => p?.id === seller.id)
      if (!prevSeller) continue

      const dailyIncrease = (Number(seller.dailySales) || 0) - (Number(prevSeller.dailySales) || 0)
      if (dailyIncrease >= SUPER_SALE_THRESHOLD) {
        setBreakingNews({
          visible: true,
          sellerName: seller.name,
          amount: dailyIncrease,
        })
        break
      }
    }

    prevSellersForBreakingRef.current = sellers
  }, [sellers])

  useEffect(() => {
    if (breakingNews.visible) {
      const timeout = setTimeout(() => {
        setBreakingNews({ visible: false, sellerName: '', amount: 0 })
      }, 8000)
      return () => clearTimeout(timeout)
    }
  }, [breakingNews.visible])

  // ---- carrossel de background ----
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

  // ---- fechar menu ao clicar fora ----
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

  // ---- handlers ----
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

  const formatCurrency = (value) => {
    const num = Number(value) || 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  // ============================================================
  // ESTADO DE LOADING
  // ============================================================
  const isLoading = sellersLoading || goalLoading || settingsLoading

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1B2E] text-white text-2xl font-space">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#2DD4BF] font-medium">Carregando painel de metas...</p>
          <p className="text-slate-500 text-sm mt-1">Sincronizando dados em tempo real</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-950">
      <ConfettiTrigger teamPercentage={teamPercentage} />

      {/* ---- Sprint Banner ---- */}
      <SprintBanner
        active={sprintActive}
        prize={sprintPrize}
        endTime={sprintEndTime}
      />

      {/* ---- Modal de senha ---- */}
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
                className="w-full px-4 py-2.5 bg-slate-800 rounded-lg border border-slate-600 focus:border-[#2DD4BF] focus:outline-none text-sm mb-3"
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

      {/* ---- Header com background ---- */}
      <header className={`relative min-h-[12rem] sm:min-h-[14rem] md:min-h-[16rem] overflow-hidden ${sprintActive ? 'mt-14 sm:mt-12' : ''}`}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${backgroundImages[bgIndex] || backgroundImages[0]})`,
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
              {(periods || []).map((p) => (
                <button
                  key={p?.id || Math.random()}
                  onClick={() => setPeriod(p?.id || 'daily')}
                  className={`
                    px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                    ${period === p?.id
                      ? 'bg-[#2DD4BF] text-slate-900 shadow-[0_0_12px_rgba(45,212,191,0.4)]'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50'
                    }
                  `}
                >
                  {p?.label || ''}
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

      {/* ---- Conteudo principal ---- */}
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
              style={{ width: `${Math.max(0, Math.min(teamPercentage, 100))}%` }}
            />
          </div>
        </div>

        {/* Botoes de view */}
        <div className="mb-4 flex items-center justify-center gap-2">
          {(showPrize ? viewLabelsAll : viewLabelsAll.slice(0, 3)).map((label, i) => (
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

        {/* Area de views com transicao */}
        <div className={`
          transition-all duration-500 ease-in-out
          ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}
        `}>
          {/* View 0: Visao Geral */}
          {currentView === 0 && (
            <div className="animate-slide-up">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="lg:col-span-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#2DD4BF] mb-3 flex items-center gap-2 font-space">
                    <span>🏆</span>
                    Vendedores
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {(sortedSellers || []).map((seller, index) => (
                      <SellerCardTV
                        key={seller?.id || index}
                        seller={seller || {}}
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

          {/* View 1: Podium */}
          {currentView === 1 && (
            <div className="animate-slide-up">
              <PodiumView sellers={sellers} period={period} />
            </div>
          )}

          {/* View 2: Motivacao */}
          {currentView === 2 && (
            <div className="animate-slide-up">
              <MotivationView
                teamPercentage={teamPercentage}
                teamTotal={teamTotal}
                teamGoal={teamGoalForPeriod}
              />
            </div>
          )}

          {/* View 3: Premio (condicional) */}
          {currentView === 3 && showPrize && (
            <div className="animate-slide-up">
              <PrizeSlide
                prizeName={mainPrizeName}
                prizeImage={mainPrizeImage}
                teamTotal={teamTotal}
                teamGoal={teamGoalForPeriod}
              />
            </div>
          )}
        </div>
      </div>

      {/* ---- Gamification Overlays ---- */}
      <OvertakeAlert alerts={overtakeAlerts} />
      <BreakingNewsOverlay
        visible={breakingNews.visible}
        sellerName={breakingNews.sellerName}
        amount={breakingNews.amount}
      />

      <MotivationalFooter />
    </div>
  )
}

export default DashboardTV

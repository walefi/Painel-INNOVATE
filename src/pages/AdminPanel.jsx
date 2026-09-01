import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSellers, useSettings, useTeamGoal } from '../hooks/useFirestore'
import { periods } from '../data/initialData'

export function AdminPanel() {
  const { sellers, loading, addSeller, updateSeller, deleteSeller, bulkUpdateSellers, initializeSellers } = useSellers()
  const { settings, updateSettings } = useSettings()
  const { teamGoal, updateTeamGoal } = useTeamGoal()
  const [period, setPeriod] = useState('daily')

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    avatar: '👤',
    avatarUrl: '',
    dailyGoal: 5000,
    monthlyGoal: 100000,
    annualGoal: 1200000,
    badges: [],
    manualTags: [],
  })

  const [saleInputs, setSaleInputs] = useState({})
  const [lastAdded, setLastAdded] = useState(null)
  const [lastRemoved, setLastRemoved] = useState(null)

  const [bulkGoalDaily, setBulkGoalDaily] = useState('')
  const [bulkGoalMonthly, setBulkGoalMonthly] = useState('')
  const [bulkGoalAnnual, setBulkGoalAnnual] = useState('')

  const avatarOptions = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍🔬', '🧑‍💼', '👨‍🔧', '👩‍🎨', '🧑‍🚀']

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      avatar: '👤',
      avatarUrl: '',
      dailyGoal: 5000,
      monthlyGoal: 100000,
      annualGoal: 1200000,
      badges: [],
      manualTags: [],
    })
  }

  const applyBulkGoals = async () => {
    const updates = sellers.map((seller) => ({
      id: seller.id,
      dailyGoal: bulkGoalDaily ? parseInt(bulkGoalDaily) : seller.dailyGoal,
      monthlyGoal: bulkGoalMonthly ? parseInt(bulkGoalMonthly) : seller.monthlyGoal,
      annualGoal: bulkGoalAnnual ? parseInt(bulkGoalAnnual) : seller.annualGoal,
    }))
    await bulkUpdateSellers(updates)
    setBulkGoalDaily('')
    setBulkGoalMonthly('')
    setBulkGoalAnnual('')
    alert('Metas atualizadas para todos os vendedores!')
  }

  const handleEdit = (seller) => {
    setFormData({
      id: seller.id,
      name: seller.name,
      avatar: seller.avatar,
      avatarUrl: seller.avatarUrl || '',
      dailyGoal: seller.dailyGoal,
      monthlyGoal: seller.monthlyGoal,
      annualGoal: seller.annualGoal,
      badges: seller.badges || [],
      manualTags: seller.manualTags || [],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este vendedor?')) {
      await deleteSeller(id)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Por favor, insira o nome do vendedor')
      return
    }
    if (formData.id) {
      await updateSeller(formData.id, formData)
    } else {
      await addSeller(formData)
    }
    resetForm()
  }

  const handleAvatarUpload = (e, sellerId) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      alert('A imagem deve ter no maximo 500KB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      if (sellerId) {
        updateSeller(sellerId, { avatar: base64 })
      } else {
        setFormData({ ...formData, avatar: base64 })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateSales = async (sellerId, field, value) => {
    const numValue = parseFloat(value) || 0
    await updateSeller(sellerId, { [field]: numValue })
  }

  const handleTeamGoalChange = async (field, value) => {
    const numValue = parseFloat(value) || 0
    await updateTeamGoal({ ...teamGoal, [field]: numValue })
  }

  const handleAddSale = async (sellerId) => {
    const value = parseFloat(saleInputs[sellerId]) || 0
    if (value <= 0) {
      alert('Insira um valor maior que zero')
      return
    }
    const seller = sellers.find(s => s.id === sellerId)
    if (!seller) return
    await updateSeller(sellerId, {
      dailySales: (seller.dailySales || 0) + value,
      monthlySales: (seller.monthlySales || 0) + value,
      annualSales: (seller.annualSales || 0) + value,
    })
    setLastAdded({ id: sellerId, value })
    setSaleInputs({ ...saleInputs, [sellerId]: '' })
    setTimeout(() => setLastAdded(null), 2000)
  }

  const handleRemoveSale = async (sellerId) => {
    const value = parseFloat(saleInputs[sellerId]) || 0
    if (value <= 0) {
      alert('Insira o valor que deseja remover')
      return
    }
    const seller = sellers.find(s => s.id === sellerId)
    if (!seller) return
    await updateSeller(sellerId, {
      dailySales: Math.max(0, (seller.dailySales || 0) - value),
      monthlySales: Math.max(0, (seller.monthlySales || 0) - value),
      annualSales: Math.max(0, (seller.annualSales || 0) - value),
    })
    setLastRemoved({ id: sellerId, value })
    setSaleInputs({ ...saleInputs, [sellerId]: '' })
    setTimeout(() => setLastRemoved(null), 2000)
  }

  const handleInitializeData = async () => {
    if (window.confirm('Isso ira popular o Firestore com os vendedores iniciais. Continuar?')) {
      await initializeSellers()
      await updateTeamGoal({ daily: 300000, monthly: 6000000, annual: 72000000 })
      await updateSettings({ monthlyResetDay: 1, lastResetDate: null })
      alert('Dados iniciais criados no Firestore!')
    }
  }

  const quickValues = [100, 250, 500, 1000, 2500, 5000]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#2DD4BF] font-medium">Carregando dados do Firestore...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#2DD4BF] flex items-center gap-2 font-space">
              <span>⚙️</span>
              <span className="truncate">Painel do Gestor</span>
            </h1>
            <p className="text-slate-400 text-[10px] sm:text-xs truncate">Innovate — Representantes Revenda</p>
          </div>
          <div className="flex items-center gap-2">
            {sellers.length === 0 && (
              <button
                onClick={handleInitializeData}
                className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-xs font-medium border border-yellow-500/30"
              >
                Iniciar Dados
              </button>
            )}
            <Link
              to="/tv"
              className="flex-shrink-0 px-3 sm:px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium border border-slate-700"
            >
              <span>📺</span>
              <span className="hidden sm:inline">Voltar ao Painel</span>
              <span className="sm:hidden">TV</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 bg-slate-900/50 rounded-xl p-3 sm:p-4 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>📅</span>
                Periodo:
              </h2>
              <div className="flex gap-1.5 sm:gap-2">
                {periods.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`
                      px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all
                      ${period === p.id
                        ? 'bg-[#2DD4BF] text-slate-900'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }
                    `}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <label className="text-[10px] sm:text-xs text-slate-400">Reset:</label>
              <select
                value={settings.monthlyResetDay}
                onChange={(e) => updateSettings({ ...settings, monthlyResetDay: parseInt(e.target.value) })}
                className="px-2 sm:px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>Dia {day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800 lg:col-span-2">
            <h2 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <span>🎯</span>
              Alterar Metas de Todos os Vendedores
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Meta Diaria (R$)</label>
                <input
                  type="number"
                  value={bulkGoalDaily}
                  onChange={(e) => setBulkGoalDaily(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                  placeholder="Ex: 50000"
                />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Meta Mensal (R$)</label>
                <input
                  type="number"
                  value={bulkGoalMonthly}
                  onChange={(e) => setBulkGoalMonthly(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                  placeholder="Ex: 1000000"
                />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Meta Anual (R$)</label>
                <input
                  type="number"
                  value={bulkGoalAnnual}
                  onChange={(e) => setBulkGoalAnnual(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                  placeholder="Ex: 12000000"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={applyBulkGoals}
                  className="w-full px-4 py-2 bg-[#2DD4BF] text-slate-900 rounded-lg hover:bg-[#2DD4BF]/80 transition-colors text-xs sm:text-sm font-medium"
                >
                  Aplicar a Todos
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
            <h2 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <span>{formData.id ? '✏️' : '➕'}</span>
              {formData.id ? 'Editar Vendedor' : 'Novo Vendedor'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                  placeholder="Nome do vendedor"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Avatar</label>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap items-center">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar })}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 text-base sm:text-xl rounded-lg border transition-all
                        ${formData.avatar === avatar
                          ? 'border-cyan-500 bg-cyan-500/20'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }
                      `}
                    >
                      {avatar}
                    </button>
                  ))}
                  <label className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-dashed border-slate-600 bg-slate-800 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarUpload(e, null)}
                      className="hidden"
                    />
                    <span className="text-slate-400 text-base sm:text-lg">📷</span>
                  </label>
                  {formData.avatar && formData.avatar.startsWith('data:') && (
                    <img src={formData.avatar} alt="Preview" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">URL da Foto (opcional)</label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                  placeholder="https://exemplo.com/foto.jpg"
                />
                {formData.avatarUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={formData.avatarUrl} alt="Preview URL" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" onError={(e) => e.target.style.display='none'} />
                    <span className="text-[10px] sm:text-xs text-slate-400">Preview da URL</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Meta Diaria</label>
                  <input
                    type="number"
                    value={formData.dailyGoal}
                    onChange={(e) => setFormData({ ...formData, dailyGoal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 sm:px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Meta Mensal</label>
                  <input
                    type="number"
                    value={formData.monthlyGoal}
                    onChange={(e) => setFormData({ ...formData, monthlyGoal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 sm:px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Meta Anual</label>
                  <input
                    type="number"
                    value={formData.annualGoal}
                    onChange={(e) => setFormData({ ...formData, annualGoal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 sm:px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Badges Especiais</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Maior Venda do Dia 💸', 'Estrela da Semana ⭐', 'Speed Demon ⚡', 'Top Performer 🎯'].map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => {
                        const currentBadges = formData.badges || []
                        const newBadges = currentBadges.includes(badge)
                          ? currentBadges.filter(b => b !== badge)
                          : [...currentBadges, badge]
                        setFormData({ ...formData, badges: newBadges })
                      }}
                      className={`
                        px-2 py-1 text-[10px] sm:text-xs rounded-lg border transition-all
                        ${(formData.badges || []).includes(badge)
                          ? 'border-[#E8A33D]/50 bg-[#E8A33D]/10 text-[#E8A33D]'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                        }
                      `}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Tags Manuais</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="manualTagInput"
                    className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                    placeholder="Ex: Cliente VIP, Urgente..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target
                        const value = input.value.trim()
                        if (value && !(formData.manualTags || []).includes(value)) {
                          setFormData({ ...formData, manualTags: [...(formData.manualTags || []), value] })
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('manualTagInput')
                      const value = input?.value.trim()
                      if (value && !(formData.manualTags || []).includes(value)) {
                        setFormData({ ...formData, manualTags: [...(formData.manualTags || []), value] })
                        if (input) input.value = ''
                      }
                    }}
                    className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-xs"
                  >
                    + Tag
                  </button>
                </div>
                {(formData.manualTags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.manualTags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30"
                      >
                        {tag}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, manualTags: formData.manualTags.filter(t => t !== tag) })}
                      className="text-[#2DD4BF] hover:text-red-400 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2DD4BF] text-slate-900 rounded-lg hover:bg-[#2DD4BF]/80 transition-colors text-xs sm:text-sm font-medium"
                >
                  {formData.id ? 'Salvar' : 'Adicionar'}
                </button>
                {formData.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-xs sm:text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
            <h2 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <span>🎯</span>
              Metas da Equipe
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Meta Diaria</label>
                <input
                  type="number"
                  value={teamGoal.daily}
                  onChange={(e) => handleTeamGoalChange('daily', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Meta Mensal</label>
                <input
                  type="number"
                  value={teamGoal.monthly}
                  onChange={(e) => handleTeamGoalChange('monthly', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1">Meta Anual</label>
                <input
                  type="number"
                  value={teamGoal.annual}
                  onChange={(e) => handleTeamGoalChange('annual', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
          <h2 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span>💰</span>
            Registrar Vendas
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {sellers.map((seller) => {
              const currentSales = seller[`${period}Sales`] || 0
              const currentGoal = seller[`${period}Goal`] || 0
              const percentage = currentGoal > 0 
                ? Math.min((currentSales / currentGoal) * 100, 100) 
                : 0
              const isCustomAvatar = seller.avatar && seller.avatar.startsWith('data:')

              return (
                <div 
                  key={seller.id}
                  className={`
                    bg-slate-800/50 rounded-xl p-3 sm:p-4 border transition-all
                    ${lastAdded?.id === seller.id 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : lastRemoved?.id === seller.id
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-slate-700/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    {isCustomAvatar ? (
                      <img src={seller.avatar} alt={seller.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover" />
                    ) : (
                      <span className="text-xl sm:text-2xl bg-slate-700/50 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
                        {seller.avatar}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-xs sm:text-sm truncate">{seller.name}</h3>
                      <p className="text-slate-400 text-[10px] sm:text-xs truncate">
                        {formatCurrency(currentSales)} / {formatCurrency(currentGoal)}
                      </p>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold flex-shrink-0 ${
                      percentage >= 100 ? 'text-green-400' :
                    percentage >= 80 ? 'text-[#2DD4BF]' :
                    percentage >= 50 ? 'text-[#E8A33D]' :
                      'text-slate-300'
                    }`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-700/50 rounded-full h-1.5 sm:h-2 mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentage >= 100 ? 'bg-green-500' :
                    percentage >= 80 ? 'bg-[#2DD4BF]' :
                    percentage >= 50 ? 'bg-[#E8A33D]' :
                    'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {(seller.badges && seller.badges.length > 0) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {seller.badges.map((badge, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/20">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                  {(seller.manualTags && seller.manualTags.length > 0) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {seller.manualTags.map((tag, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {quickValues.map((val) => (
                      <button
                        key={val}
                        onClick={() => setSaleInputs({ ...saleInputs, [seller.id]: val.toString() })}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                      >
                        +{formatCurrency(val)}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5 sm:gap-2 mb-2">
                    <input
                      type="number"
                      value={saleInputs[seller.id] || ''}
                      onChange={(e) => setSaleInputs({ ...saleInputs, [seller.id]: e.target.value })}
                      placeholder="Valor"
                      className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 bg-slate-700 rounded-lg border border-slate-600                   focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSale(seller.id)
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddSale(seller.id)}
                      className="px-2 sm:px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-[10px] sm:text-xs font-medium"
                    >
                      + Venda
                    </button>
                    <button
                      onClick={() => handleRemoveSale(seller.id)}
                      className="px-2 sm:px-3 py-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors text-[10px] sm:text-xs font-medium"
                    >
                      − Remover
                    </button>
                  </div>

                  {lastAdded?.id === seller.id && (
                    <p className="text-green-400 text-[10px] sm:text-xs text-center font-medium animate-pulse">
                      ✓ +{formatCurrency(lastAdded.value)} registrada!
                    </p>
                  )}
                  {lastRemoved?.id === seller.id && (
                    <p className="text-red-400 text-[10px] sm:text-xs text-center font-medium animate-pulse">
                      ✗ −{formatCurrency(lastRemoved.value)} removida!
                    </p>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                    <label className="flex items-center justify-center w-full py-1.5 bg-slate-700/30 rounded-lg border border-dashed border-slate-600 cursor-pointer hover:border-[#2DD4BF]/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarUpload(e, seller.id)}
                        className="hidden"
                      />
                      <span className="text-[10px] sm:text-xs text-slate-400">📷 Enviar foto</span>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
          <h2 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span>📋</span>
            Edicao Avancada
          </h2>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Vendedor</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Vendas {periods.find(p => p.id === period)?.label}</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Meta</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Progresso</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => {
                  const currentSales = seller[`${period}Sales`] || 0
                  const currentGoal = seller[`${period}Goal`] || 0
                  const percentage = currentGoal > 0 
                    ? Math.min((currentSales / currentGoal) * 100, 100) 
                    : 0
                  const isCustomAvatar = seller.avatar && seller.avatar.startsWith('data:')

                  return (
                    <tr key={seller.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-2 sm:py-3">
                        <div className="flex items-center gap-2">
                          {isCustomAvatar ? (
                            <img src={seller.avatar} alt={seller.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover" />
                          ) : (
                            <span className="text-base sm:text-xl">{seller.avatar}</span>
                          )}
                          <span className="text-white font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{seller.name}</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3">
                        <input
                          type="number"
                          value={currentSales}
                          onChange={(e) => handleUpdateSales(seller.id, `${period}Sales`, e.target.value)}
                          className="w-20 sm:w-28 px-1.5 sm:px-2 py-1 bg-slate-800 rounded border border-slate-700 focus:border-cyan-500 focus:outline-none text-[10px] sm:text-xs"
                        />
                      </td>
                      <td className="py-2 sm:py-3 text-slate-300 text-[10px] sm:text-xs">
                        {formatCurrency(currentGoal)}
                      </td>
                      <td className="py-2 sm:py-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-14 sm:w-20 bg-slate-800 rounded-full h-1 sm:h-1.5">
                            <div
                              className={`h-full rounded-full ${
                                percentage >= 100 ? 'bg-green-500' :
                percentage >= 80 ? 'bg-[#2DD4BF]' :
                'bg-blue-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] sm:text-xs text-slate-400">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 text-right">
                        <button
                          onClick={() => handleEdit(seller)}
                          className="px-1.5 sm:px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors mr-1 text-[10px] sm:text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(seller.id)}
                          className="px-1.5 sm:px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-[10px] sm:text-xs"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

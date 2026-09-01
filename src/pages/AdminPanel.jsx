import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialSellers, initialTeamGoal, initialSettings, periods } from '../data/initialData'

export function AdminPanel() {
  const [sellers, setSellers] = useLocalStorage('metaVendedores_sellers', initialSellers)
  const [teamGoal, setTeamGoal] = useLocalStorage('metaVendedores_teamGoal', initialTeamGoal)
  const [settings, setSettings] = useLocalStorage('metaVendedores_settings', initialSettings)
  const [period, setPeriod] = useState('daily')

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    avatar: '👤',
    dailyGoal: 5000,
    monthlyGoal: 100000,
    annualGoal: 1200000,
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
      dailyGoal: 5000,
      monthlyGoal: 100000,
      annualGoal: 1200000,
    })
  }

  const applyBulkGoals = () => {
    const updated = sellers.map((seller) => ({
      ...seller,
      dailyGoal: bulkGoalDaily ? parseInt(bulkGoalDaily) : seller.dailyGoal,
      monthlyGoal: bulkGoalMonthly ? parseInt(bulkGoalMonthly) : seller.monthlyGoal,
      annualGoal: bulkGoalAnnual ? parseInt(bulkGoalAnnual) : seller.annualGoal,
    }))
    setSellers(updated)
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
      dailyGoal: seller.dailyGoal,
      monthlyGoal: seller.monthlyGoal,
      annualGoal: seller.annualGoal,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja remover este vendedor?')) {
      setSellers(sellers.filter((s) => s.id !== id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Por favor, insira o nome do vendedor')
      return
    }
    if (formData.id) {
      setSellers(sellers.map((s) => {
        if (s.id !== formData.id) return s
        return { ...s, ...formData }
      }))
    } else {
      setSellers([...sellers, {
        ...formData,
        id: Date.now(),
        dailySales: 0,
        monthlySales: 0,
        annualSales: 0,
      }])
    }
    resetForm()
  }

  const handleAvatarUpload = (e, sellerId) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      alert('A imagem deve ter no máximo 500KB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      if (sellerId) {
        setSellers(sellers.map((s) => s.id === sellerId ? { ...s, avatar: base64 } : s))
      } else {
        setFormData({ ...formData, avatar: base64 })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateSales = (sellerId, field, value) => {
    const numValue = parseFloat(value) || 0
    setSellers(sellers.map((s) => s.id === sellerId ? { ...s, [field]: numValue } : s))
  }

  const handleTeamGoalChange = (field, value) => {
    const numValue = parseFloat(value) || 0
    setTeamGoal({ ...teamGoal, [field]: numValue })
  }

  const handleAddSale = (sellerId) => {
    const value = parseFloat(saleInputs[sellerId]) || 0
    if (value <= 0) {
      alert('Insira um valor maior que zero')
      return
    }
    setSellers(sellers.map((s) => {
      if (s.id !== sellerId) return s
      return {
        ...s,
        dailySales: s.dailySales + value,
        monthlySales: s.monthlySales + value,
        annualSales: s.annualSales + value,
      }
    }))
    setLastAdded({ id: sellerId, value })
    setSaleInputs({ ...saleInputs, [sellerId]: '' })
    setTimeout(() => setLastAdded(null), 2000)
  }

  const handleRemoveSale = (sellerId) => {
    const value = parseFloat(saleInputs[sellerId]) || 0
    if (value <= 0) {
      alert('Insira o valor que deseja remover')
      return
    }
    setSellers(sellers.map((s) => {
      if (s.id !== sellerId) return s
      return {
        ...s,
        dailySales: Math.max(0, s.dailySales - value),
        monthlySales: Math.max(0, s.monthlySales - value),
        annualSales: Math.max(0, s.annualSales - value),
      }
    }))
    setLastRemoved({ id: sellerId, value })
    setSaleInputs({ ...saleInputs, [sellerId]: '' })
    setTimeout(() => setLastRemoved(null), 2000)
  }

  const quickValues = [100, 250, 500, 1000, 2500, 5000]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <span>⚙️</span>
              Painel do Gestor
            </h1>
            <p className="text-slate-400 text-xs">Viva Brasília — Representantes Revenda</p>
          </div>
          <Link
            to="/tv"
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium border border-slate-700"
          >
            <span>📺</span>
            Voltar ao Painel
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Configurações Gerais */}
        <div className="mb-6 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📅</span>
                Período:
              </h2>
              <div className="flex gap-2">
                {periods.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`
                      px-4 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${period === p.id
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }
                    `}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400">Reset mensal no dia:</label>
              <select
                value={settings.monthlyResetDay}
                onChange={(e) => setSettings({ ...settings, monthlyResetDay: parseInt(e.target.value) })}
                className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metas de Todos os Vendedores */}
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 lg:col-span-2">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span>🎯</span>
              Alterar Metas de Todos os Vendedores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Meta Diária (R$)</label>
                <input
                  type="number"
                  value={bulkGoalDaily}
                  onChange={(e) => setBulkGoalDaily(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                  placeholder="Ex: 50000"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Meta Mensal (R$)</label>
                <input
                  type="number"
                  value={bulkGoalMonthly}
                  onChange={(e) => setBulkGoalMonthly(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                  placeholder="Ex: 1000000"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Meta Anual (R$)</label>
                <input
                  type="number"
                  value={bulkGoalAnnual}
                  onChange={(e) => setBulkGoalAnnual(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                  placeholder="Ex: 12000000"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={applyBulkGoals}
                  className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                >
                  Aplicar a Todos
                </button>
              </div>
            </div>
          </div>

          {/* Formulário de Vendedor */}
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span>{formData.id ? '✏️' : '➕'}</span>
              {formData.id ? 'Editar Vendedor' : 'Novo Vendedor'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                  placeholder="Nome do vendedor"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Avatar</label>
                <div className="flex gap-2 flex-wrap items-center">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar })}
                      className={`
                        w-10 h-10 text-xl rounded-lg border transition-all
                        ${formData.avatar === avatar
                          ? 'border-cyan-500 bg-cyan-500/20'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }
                      `}
                    >
                      {avatar}
                    </button>
                  ))}
                  <label className="w-10 h-10 rounded-lg border border-dashed border-slate-600 bg-slate-800 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarUpload(e, null)}
                      className="hidden"
                    />
                    <span className="text-slate-400 text-lg">📷</span>
                  </label>
                  {formData.avatar && formData.avatar.startsWith('data:') && (
                    <img src={formData.avatar} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Meta Diária</label>
                  <input
                    type="number"
                    value={formData.dailyGoal}
                    onChange={(e) => setFormData({ ...formData, dailyGoal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Meta Mensal</label>
                  <input
                    type="number"
                    value={formData.monthlyGoal}
                    onChange={(e) => setFormData({ ...formData, monthlyGoal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Meta Anual</label>
                  <input
                    type="number"
                    value={formData.annualGoal}
                    onChange={(e) => setFormData({ ...formData, annualGoal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                >
                  {formData.id ? 'Salvar' : 'Adicionar'}
                </button>
                {formData.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Metas da Equipe */}
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span>🎯</span>
              Metas da Equipe
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Meta Diária</label>
                <input
                  type="number"
                  value={teamGoal.daily}
                  onChange={(e) => handleTeamGoalChange('daily', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Meta Mensal</label>
                <input
                  type="number"
                  value={teamGoal.monthly}
                  onChange={(e) => handleTeamGoalChange('monthly', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Meta Anual</label>
                <input
                  type="number"
                  value={teamGoal.annual}
                  onChange={(e) => handleTeamGoalChange('annual', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Registrar Vendas */}
        <div className="mt-6 bg-slate-900/50 rounded-xl p-5 border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>💰</span>
            Registrar Vendas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellers.map((seller) => {
              const currentSales = seller[`${period}Sales`]
              const currentGoal = seller[`${period}Goal`]
              const percentage = currentGoal > 0 
                ? Math.min((currentSales / currentGoal) * 100, 100) 
                : 0
              const isCustomAvatar = seller.avatar && seller.avatar.startsWith('data:')

              return (
                <div 
                  key={seller.id}
                  className={`
                    bg-slate-800/50 rounded-xl p-4 border transition-all
                    ${lastAdded?.id === seller.id 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : lastRemoved?.id === seller.id
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-slate-700/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {isCustomAvatar ? (
                      <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <span className="text-2xl bg-slate-700/50 w-10 h-10 rounded-lg flex items-center justify-center">
                        {seller.avatar}
                      </span>
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm">{seller.name}</h3>
                      <p className="text-slate-400 text-xs">
                        {formatCurrency(currentSales)} / {formatCurrency(currentGoal)}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${
                      percentage >= 100 ? 'text-green-400' :
                      percentage >= 80 ? 'text-cyan-400' :
                      percentage >= 50 ? 'text-orange-400' :
                      'text-slate-300'
                    }`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentage >= 100 ? 'bg-green-500' :
                        percentage >= 80 ? 'bg-cyan-500' :
                        percentage >= 50 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {quickValues.map((val) => (
                      <button
                        key={val}
                        onClick={() => setSaleInputs({ ...saleInputs, [seller.id]: val.toString() })}
                        className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                      >
                        +{formatCurrency(val)}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={saleInputs[seller.id] || ''}
                      onChange={(e) => setSaleInputs({ ...saleInputs, [seller.id]: e.target.value })}
                      placeholder="Valor"
                      className="flex-1 px-3 py-1.5 bg-slate-700 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSale(seller.id)
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddSale(seller.id)}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                    >
                      + Venda
                    </button>
                    <button
                      onClick={() => handleRemoveSale(seller.id)}
                      className="px-3 py-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                    >
                      − Remover
                    </button>
                  </div>

                  {lastAdded?.id === seller.id && (
                    <p className="text-green-400 text-xs text-center font-medium animate-pulse">
                      ✓ +{formatCurrency(lastAdded.value)} registrada!
                    </p>
                  )}
                  {lastRemoved?.id === seller.id && (
                    <p className="text-red-400 text-xs text-center font-medium animate-pulse">
                      ✗ −{formatCurrency(lastRemoved.value)} removida!
                    </p>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                    <label className="text-xs text-slate-500 block mb-1">Foto do vendedor:</label>
                    <label className="flex items-center justify-center w-full py-1.5 bg-slate-700/30 rounded-lg border border-dashed border-slate-600 cursor-pointer hover:border-cyan-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarUpload(e, seller.id)}
                        className="hidden"
                      />
                      <span className="text-xs text-slate-400">📷 Enviar foto</span>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tabela de edição avançada */}
        <div className="mt-6 bg-slate-900/50 rounded-xl p-5 border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>📋</span>
            Edição Avançada
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-2 text-xs font-medium">Vendedor</th>
                  <th className="pb-2 text-xs font-medium">Vendas {periods.find(p => p.id === period)?.label}</th>
                  <th className="pb-2 text-xs font-medium">Meta</th>
                  <th className="pb-2 text-xs font-medium">Progresso</th>
                  <th className="pb-2 text-xs font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => {
                  const currentSales = seller[`${period}Sales`]
                  const currentGoal = seller[`${period}Goal`]
                  const percentage = currentGoal > 0 
                    ? Math.min((currentSales / currentGoal) * 100, 100) 
                    : 0
                  const isCustomAvatar = seller.avatar && seller.avatar.startsWith('data:')

                  return (
                    <tr key={seller.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {isCustomAvatar ? (
                            <img src={seller.avatar} alt={seller.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <span className="text-xl">{seller.avatar}</span>
                          )}
                          <span className="text-white font-medium text-sm">{seller.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={seller[`${period}Sales`]}
                          onChange={(e) => handleUpdateSales(seller.id, `${period}Sales`, e.target.value)}
                          className="w-28 px-2 py-1 bg-slate-800 rounded border border-slate-700 focus:border-cyan-500 focus:outline-none text-xs"
                        />
                      </td>
                      <td className="py-3 text-slate-300 text-xs">
                        {formatCurrency(currentGoal)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-800 rounded-full h-1.5">
                            <div
                              className={`h-full rounded-full ${
                                percentage >= 100 ? 'bg-green-500' :
                                percentage >= 80 ? 'bg-cyan-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleEdit(seller)}
                          className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors mr-1 text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(seller.id)}
                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-xs"
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
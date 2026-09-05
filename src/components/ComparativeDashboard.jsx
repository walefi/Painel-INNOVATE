import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const COLORS = ['#2DD4BF', '#E8A33D', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B']

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function ComparativeDashboard({ sellers, salesHistory }) {
  const [comparisonType, setComparisonType] = useState('sellers')
  const [selectedSellers, setSelectedSellers] = useState([])

  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const sellerComparisonData = useMemo(() => {
    if (comparisonType !== 'sellers') return []
    
    return sellers.map(seller => ({
      name: seller.name,
      diario: seller.dailySales || 0,
      mensal: seller.monthlySales || 0,
      anual: seller.annualSales || 0,
      metaDiaria: seller.dailyGoal || 0,
      metaMensal: seller.monthlyGoal || 0,
      metaAnual: seller.annualGoal || 0,
      atingimentoDiario: seller.dailyGoal > 0 ? Math.round(((seller.dailySales || 0) / seller.dailyGoal) * 100) : 0,
      atingimentoMensal: seller.monthlyGoal > 0 ? Math.round(((seller.monthlySales || 0) / seller.monthlyGoal) * 100) : 0,
      atingimentoAnual: seller.annualGoal > 0 ? Math.round(((seller.annualSales || 0) / seller.annualGoal) * 100) : 0,
    }))
  }, [sellers, comparisonType])

  const monthlyComparisonData = useMemo(() => {
    if (comparisonType !== 'months') return []
    
    const activeSales = salesHistory.filter(s => s.status !== 'cancelled' && s.type === 'add')
    
    return MONTHS.slice(0, currentMonth + 1).map((month, index) => {
      const monthSales = activeSales.filter(s => {
        const saleDate = new Date(s.timestamp)
        return saleDate.getMonth() === index && saleDate.getFullYear() === currentYear
      })
      
      const totalBySeller = {}
      sellers.forEach(seller => {
        const sellerSales = monthSales.filter(s => s.sellerId === seller.id)
        totalBySeller[seller.name] = sellerSales.reduce((sum, s) => sum + (s.value || 0), 0)
      })
      
      return {
        month: month.substring(0, 3),
        ...totalBySeller,
        total: monthSales.reduce((sum, s) => sum + (s.value || 0), 0),
      }
    })
  }, [sellers, salesHistory, comparisonType, currentYear, currentMonth])

  const periodComparisonData = useMemo(() => {
    if (comparisonType !== 'periods') return []
    
    return sellers.map(seller => ({
      name: seller.name,
      diario: seller.dailySales || 0,
      mensal: seller.monthlySales || 0,
      anual: seller.annualSales || 0,
    }))
  }, [sellers, comparisonType])

  const radarData = useMemo(() => {
    if (comparisonType !== 'radar') return []
    
    const topSellers = sellers
      .filter(s => selectedSellers.length === 0 || selectedSellers.includes(s.id))
      .sort((a, b) => (b.annualSales || 0) - (a.annualSales || 0))
      .slice(0, 5)
    
    return [
      { metric: 'Vendas Diarias', ...Object.fromEntries(topSellers.map(s => [s.name, s.dailySales || 0])) },
      { metric: 'Vendas Mensais', ...Object.fromEntries(topSellers.map(s => [s.name, (s.monthlySales || 0) / 100])) },
      { metric: 'Vendas Anuais', ...Object.fromEntries(topSellers.map(s => [s.name, (s.annualSales || 0) / 1000])) },
      { metric: 'Meta Diaria', ...Object.fromEntries(topSellers.map(s => [s.name, s.dailyGoal || 0])) },
      { metric: 'Meta Mensal', ...Object.fromEntries(topSellers.map(s => [s.name, (s.monthlyGoal || 0) / 100])) },
      { metric: 'Meta Anual', ...Object.fromEntries(topSellers.map(s => [s.name, (s.annualGoal || 0) / 1000])) },
    ]
  }, [sellers, comparisonType, selectedSellers])

  const toggleSeller = (sellerId) => {
    setSelectedSellers(prev => 
      prev.includes(sellerId) 
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    )
  }

  const visibleSellers = selectedSellers.length === 0 
    ? sellers 
    : sellers.filter(s => selectedSellers.includes(s.id))

  const sortedByPerformance = useMemo(() => {
    return [...sellerComparisonData].sort((a, b) => b.atingimentoMensal - a.atingimentoMensal)
  }, [sellerComparisonData])

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
          <span>📊</span>
          Dashboard Comparativo
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'sellers', label: 'Vendedores' },
            { id: 'months', label: 'Meses' },
            { id: 'periods', label: 'Periodos' },
            { id: 'radar', label: 'Radar' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setComparisonType(type.id)}
              className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-lg transition-colors ${
                comparisonType === type.id
                  ? 'bg-[#2DD4BF] text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {comparisonType === 'radar' && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {sellers.map((seller, index) => (
            <button
              key={seller.id}
              onClick={() => toggleSeller(seller.id)}
              className={`px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-colors ${
                selectedSellers.includes(seller.id)
                  ? 'text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
              }`}
              style={selectedSellers.includes(seller.id) ? { backgroundColor: COLORS[index % COLORS.length] } : {}}
            >
              {seller.name}
            </button>
          ))}
        </div>
      )}

      <div className="h-64 sm:h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          {comparisonType === 'sellers' ? (
            <BarChart data={sellerComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="diario" name="Diario" fill="#2DD4BF" radius={[2, 2, 0, 0]} />
              <Bar dataKey="mensal" name="Mensal" fill="#E8A33D" radius={[2, 2, 0, 0]} />
              <Bar dataKey="anual" name="Anual" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : comparisonType === 'months' ? (
            <BarChart data={monthlyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              {visibleSellers.map((seller, index) => (
                <Bar 
                  key={seller.id} 
                  dataKey={seller.name} 
                  fill={COLORS[index % COLORS.length]} 
                  stackId="stack"
                  radius={[0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          ) : comparisonType === 'periods' ? (
            <BarChart data={periodComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="diario" name="Diario" fill="#2DD4BF" radius={[2, 2, 0, 0]} />
              <Bar dataKey="mensal" name="Mensal" fill="#E8A33D" radius={[2, 2, 0, 0]} />
              <Bar dataKey="anual" name="Anual" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
              <PolarRadiusAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend />
              {visibleSellers.slice(0, 5).map((seller, index) => (
                <Radar
                  key={seller.id}
                  name={seller.name}
                  dataKey={seller.name}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>

      {comparisonType === 'sellers' && (
        <div>
          <h3 className="text-[10px] sm:text-xs font-bold text-slate-300 mb-2">Ranking de Atingimento (Mensal)</h3>
          <div className="space-y-2">
            {sortedByPerformance.map((seller, index) => (
              <div key={index} className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <span className={`text-[10px] sm:text-xs font-bold w-6 text-center ${
                  index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                }`}>
                  {index + 1}º
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">{seller.name}</p>
                  <div className="flex gap-4 text-[10px] sm:text-xs text-slate-400">
                    <span>Vendas: {formatCurrency(seller.mensal)}</span>
                    <span>Meta: {formatCurrency(seller.metaMensal)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm sm:text-base font-bold ${
                    seller.atingimentoMensal >= 100 ? 'text-green-400' :
                    seller.atingimentoMensal >= 80 ? 'text-[#2DD4BF]' :
                    seller.atingimentoMensal >= 50 ? 'text-[#E8A33D]' :
                    'text-slate-300'
                  }`}>
                    {seller.atingimentoMensal}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {comparisonType === 'months' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {monthlyComparisonData.map((monthData, index) => (
            <div key={index} className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
              <p className="text-white text-xs sm:text-sm font-medium">{monthData.month}</p>
              <p className="text-[#2DD4BF] text-[10px] sm:text-xs font-bold">{formatCurrency(monthData.total)}</p>
            </div>
          ))}
        </div>
      )}

      {comparisonType === 'periods' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
            <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Total Diario</p>
            <p className="text-[#2DD4BF] font-bold text-sm sm:text-lg">
              {formatCurrency(periodComparisonData.reduce((sum, s) => sum + s.diario, 0))}
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
            <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Total Mensal</p>
            <p className="text-[#E8A33D] font-bold text-sm sm:text-lg">
              {formatCurrency(periodComparisonData.reduce((sum, s) => sum + s.mensal, 0))}
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
            <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Total Anual</p>
            <p className="text-[#3B82F6] font-bold text-sm sm:text-lg">
              {formatCurrency(periodComparisonData.reduce((sum, s) => sum + s.anual, 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
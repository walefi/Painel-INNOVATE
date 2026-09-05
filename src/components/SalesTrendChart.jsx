import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

function formatMonth(monthIndex) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return months[monthIndex]
}

const COLORS = ['#2DD4BF', '#E8A33D', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B']

export function SalesTrendChart({ salesHistory, sellers, period = 'monthly' }) {
  const [selectedSellers, setSelectedSellers] = useState([])
  const [chartType, setChartType] = useState('line')

  const trendData = useMemo(() => {
    if (!salesHistory || salesHistory.length === 0) return []

    const activeSales = salesHistory.filter(s => s.status !== 'cancelled' && s.type === 'add')
    
    if (period === 'daily') {
      return processDailyData(activeSales, sellers, selectedSellers)
    } else if (period === 'monthly') {
      return processMonthlyData(activeSales, sellers, selectedSellers)
    } else {
      return processAnnualData(activeSales, sellers, selectedSellers)
    }
  }, [salesHistory, sellers, period, selectedSellers])

  function processDailyData(sales, sellersList, selected) {
    const last30Days = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const daySales = sales.filter(s => {
        const saleDate = new Date(s.timestamp)
        return saleDate >= date && saleDate < nextDate
      })
      
      const dataPoint = { date: formatDate(date.toISOString()) }
      
      sellersList.forEach(seller => {
        if (selected.length === 0 || selected.includes(seller.id)) {
          const sellerSales = daySales.filter(s => s.sellerId === seller.id)
          dataPoint[seller.name] = sellerSales.reduce((sum, s) => sum + (s.value || 0), 0)
        }
      })
      
      dataPoint['Total'] = Object.keys(dataPoint)
        .filter(k => k !== 'date')
        .reduce((sum, k) => sum + (dataPoint[k] || 0), 0)
      
      last30Days.push(dataPoint)
    }
    
    return last30Days
  }

  function processMonthlyData(sales, sellersList, selected) {
    const last12Months = []
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthSales = sales.filter(s => {
        const saleDate = new Date(s.timestamp)
        return saleDate >= date && saleDate <= nextMonth
      })
      
      const dataPoint = { month: formatMonth(date.getMonth()), year: date.getFullYear() }
      
      sellersList.forEach(seller => {
        if (selected.length === 0 || selected.includes(seller.id)) {
          const sellerSales = monthSales.filter(s => s.sellerId === seller.id)
          dataPoint[seller.name] = sellerSales.reduce((sum, s) => sum + (s.value || 0), 0)
        }
      })
      
      dataPoint['Total'] = Object.keys(dataPoint)
        .filter(k => k !== 'month' && k !== 'year')
        .reduce((sum, k) => sum + (dataPoint[k] || 0), 0)
      
      last12Months.push(dataPoint)
    }
    
    return last12Months
  }

  function processAnnualData(sales, sellersList, selected) {
    const last5Years = []
    const currentYear = new Date().getFullYear()
    
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i
      const startOfYear = new Date(year, 0, 1)
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)
      
      const yearSales = sales.filter(s => {
        const saleDate = new Date(s.timestamp)
        return saleDate >= startOfYear && saleDate <= endOfYear
      })
      
      const dataPoint = { year: year.toString() }
      
      sellersList.forEach(seller => {
        if (selected.length === 0 || selected.includes(seller.id)) {
          const sellerSales = yearSales.filter(s => s.sellerId === seller.id)
          dataPoint[seller.name] = sellerSales.reduce((sum, s) => sum + (s.value || 0), 0)
        }
      })
      
      dataPoint['Total'] = Object.keys(dataPoint)
        .filter(k => k !== 'year')
        .reduce((sum, k) => sum + (dataPoint[k] || 0), 0)
      
      last5Years.push(dataPoint)
    }
    
    return last5Years
  }

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

  const xKey = period === 'daily' ? 'date' : period === 'monthly' ? 'month' : 'year'

  if (trendData.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
        <h2 className="text-xs sm:text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span>📈</span>
          Tendencia de Vendas
        </h2>
        <div className="text-center py-8">
          <p className="text-slate-500 text-xs sm:text-sm">Nenhum dado de vendas disponivel para gerar grafico.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
          <span>📈</span>
          Tendencia de Vendas
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-lg transition-colors ${
              chartType === 'line'
                ? 'bg-[#2DD4BF] text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Linha
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-lg transition-colors ${
              chartType === 'bar'
                ? 'bg-[#2DD4BF] text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Barras
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setSelectedSellers([])}
          className={`px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-colors ${
            selectedSellers.length === 0
              ? 'bg-[#2DD4BF] text-slate-900'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          Todos
        </button>
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

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey={xKey} 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              {visibleSellers.map((seller, index) => (
                <Line
                  key={seller.id}
                  type="monotone"
                  dataKey={seller.name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
              <Line
                type="monotone"
                dataKey="Total"
                stroke="#ffffff"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          ) : (
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey={xKey} 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              {visibleSellers.map((seller, index) => (
                <Bar
                  key={seller.id}
                  dataKey={seller.name}
                  fill={COLORS[index % COLORS.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {visibleSellers.slice(0, 4).map((seller, index) => {
          const sellerTotal = trendData.reduce((sum, d) => sum + (d[seller.name] || 0), 0)
          const lastPeriod = trendData[trendData.length - 1]?.[seller.name] || 0
          const prevPeriod = trendData[trendData.length - 2]?.[seller.name] || 0
          const growth = prevPeriod > 0 ? ((lastPeriod - prevPeriod) / prevPeriod * 100) : 0
          
          return (
            <div key={seller.id} className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
              <div className="flex items-center gap-1.5 mb-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <p className="text-white text-[10px] sm:text-xs font-medium truncate">{seller.name}</p>
              </div>
              <p className="text-[#2DD4BF] text-[10px] sm:text-xs font-bold">{formatCurrency(sellerTotal)}</p>
              {growth !== 0 && (
                <p className={`text-[10px] ${growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {growth > 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
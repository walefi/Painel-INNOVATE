import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSalesHistory, useSellers } from '../hooks/useFirestore'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SalesFilter({ sellers }) {
  const { getDailySalesSummary, getMonthlySalesSummary, getAnnualSalesSummary, cancelSale, cancelSalesByPeriod } = useSalesHistory()
  const { updateSeller } = useSellers()
  
  const [filterType, setFilterType] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedSeller, setSelectedSeller] = useState('all')
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)
  const [bulkCancelling, setBulkCancelling] = useState(false)

  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const loadSalesData = useCallback(async () => {
    setLoading(true)
    try {
      let data = []
      const sellerId = selectedSeller === 'all' ? null : selectedSeller

      switch (filterType) {
        case 'daily':
          data = await getDailySalesSummary(selectedDate, sellerId)
          break
        case 'monthly':
          data = await getMonthlySalesSummary(selectedYear, selectedMonth, sellerId)
          break
        case 'annual':
          data = await getAnnualSalesSummary(selectedYear, sellerId)
          break
      }

      setSalesData(data)
    } catch (err) {
      console.error('Erro ao carregar vendas:', err)
      setSalesData([])
    } finally {
      setLoading(false)
    }
  }, [filterType, selectedDate, selectedMonth, selectedYear, selectedSeller, getDailySalesSummary, getMonthlySalesSummary, getAnnualSalesSummary])

  useEffect(() => {
    loadSalesData()
  }, [loadSalesData])

  const summary = useMemo(() => {
    const activeSales = salesData.filter(s => s.status !== 'cancelled')
    
    const totalAdd = activeSales
      .filter(s => s.type === 'add')
      .reduce((sum, s) => sum + (s.value || 0), 0)
    
    const totalRemove = activeSales
      .filter(s => s.type === 'remove')
      .reduce((sum, s) => sum + (s.value || 0), 0)
    
    const totalCancellations = salesData
      .filter(s => s.type === 'cancellation' && s.status === 'active')
      .reduce((sum, s) => sum + (s.value || 0), 0)
    
    const netTotal = totalAdd - totalRemove - totalCancellations
    const transactionCount = activeSales.length
    const cancelledCount = salesData.filter(s => s.status === 'cancelled').length

    return { totalAdd, totalRemove, totalCancellations, netTotal, transactionCount, cancelledCount }
  }, [salesData])

  const dailySummaryBySeller = useMemo(() => {
    if (filterType !== 'daily') return []
    
    const sellerMap = {}
    const activeSales = salesData.filter(s => s.status !== 'cancelled')
    
    activeSales.forEach(sale => {
      if (!sellerMap[sale.sellerId]) {
        sellerMap[sale.sellerId] = {
          sellerId: sale.sellerId,
          sellerName: sale.sellerName,
          totalAdd: 0,
          totalRemove: 0,
          netTotal: 0,
        }
      }
      if (sale.type === 'add') {
        sellerMap[sale.sellerId].totalAdd += sale.value || 0
      } else if (sale.type === 'remove') {
        sellerMap[sale.sellerId].totalRemove += sale.value || 0
      }
      sellerMap[sale.sellerId].netTotal = sellerMap[sale.sellerId].totalAdd - sellerMap[sale.sellerId].totalRemove
    })
    
    return Object.values(sellerMap).sort((a, b) => b.netTotal - a.netTotal)
  }, [salesData, filterType])

  const handleCancelSale = async (sale) => {
    if (!window.confirm(`Tem certeza que deseja cancelar esta venda de ${formatCurrency(sale.value)}?`)) {
      return
    }
    
    setCancellingId(sale.id)
    try {
      await cancelSale(sale, sellers, updateSeller)
      await loadSalesData()
    } catch (err) {
      console.error('Erro ao cancelar venda:', err)
      alert('Erro ao cancelar venda: ' + err.message)
    } finally {
      setCancellingId(null)
    }
  }

  const handleBulkCancel = async () => {
    if (selectedSeller === 'all') {
      alert('Selecione um vendedor especifico para cancelar vendas em lote.')
      return
    }

    const seller = sellers.find(s => s.id === selectedSeller)
    const periodLabel = filterType === 'daily' ? 'diarias' : filterType === 'monthly' ? 'mensais' : 'anuais'
    
    if (!window.confirm(`Tem certeza que deseja cancelar TODAS as vendas ${periodLabel} de ${seller?.name}?`)) {
      return
    }

    setBulkCancelling(true)
    try {
      const result = await cancelSalesByPeriod(selectedSeller, filterType, sellers, updateSeller)
      
      if (result.cancelled === 0) {
        alert('Nenhuma venda ativa encontrada para cancelamento neste periodo.')
      } else {
        alert(`${result.cancelled} venda(s) cancelada(s). Total: ${formatCurrency(result.total)}`)
        await loadSalesData()
      }
    } catch (err) {
      console.error('Erro ao cancelar vendas em lote:', err)
      alert('Erro ao cancelar vendas: ' + err.message)
    } finally {
      setBulkCancelling(false)
    }
  }

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
      <h2 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
        <span>📊</span>
        Filtro de Vendas por Periodo
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Tipo de Filtro</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
          >
            <option value="daily">Diario</option>
            <option value="monthly">Mensal</option>
            <option value="annual">Anual</option>
          </select>
        </div>

        {filterType === 'daily' && (
          <div>
            <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
            />
          </div>
        )}

        {filterType === 'monthly' && (
          <>
            <div>
              <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Mes</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Ano</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {filterType === 'annual' && (
          <div>
            <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-[10px] sm:text-xs text-slate-400 block mb-1">Vendedor</label>
          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-[#2DD4BF] focus:outline-none text-xs sm:text-sm"
          >
            <option value="all">Todos os Vendedores</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={handleBulkCancel}
          disabled={bulkCancelling || selectedSeller === 'all'}
          className="px-5 py-2.5 text-sm bg-orange-500/20 text-orange-400 rounded-xl hover:bg-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-orange-500/40 flex items-center justify-center gap-2 font-semibold"
        >
          {bulkCancelling ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Cancelando...
            </>
          ) : (
            <>
              <span>🗑️</span>
              Cancelar Vendas {filterType === 'daily' ? 'Diarias' : filterType === 'monthly' ? 'Mensais' : 'Anuais'}
            </>
          )}
        </button>
        {selectedSeller === 'all' && (
          <p className="text-slate-500 text-xs flex items-center">
            Selecione um vendedor especifico para cancelar vendas em lote
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Total Adicionado</p>
          <p className="text-green-400 font-bold text-sm sm:text-lg">+{formatCurrency(summary.totalAdd)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Total Removido</p>
          <p className="text-red-400 font-bold text-sm sm:text-lg">-{formatCurrency(summary.totalRemove)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Cancelamentos</p>
          <p className="text-orange-400 font-bold text-sm sm:text-lg">-{formatCurrency(summary.totalCancellations)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Saldo Liquido</p>
          <p className={`font-bold text-sm sm:text-lg ${summary.netTotal >= 0 ? 'text-[#2DD4BF]' : 'text-red-400'}`}>
            {formatCurrency(summary.netTotal)}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Canceladas</p>
          <p className="text-orange-400 font-bold text-sm sm:text-lg">{summary.cancelledCount}</p>
        </div>
      </div>

      {filterType === 'daily' && dailySummaryBySeller.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] sm:text-xs font-bold text-slate-300 mb-2">Resumo por Vendedor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {dailySummaryBySeller.map((seller) => (
              <div key={seller.sellerId} className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <p className="text-white text-xs sm:text-sm font-medium truncate">{seller.sellerName}</p>
                <div className="flex justify-between text-[10px] sm:text-xs mt-1">
                  <span className="text-green-400">+{formatCurrency(seller.totalAdd)}</span>
                  <span className="text-red-400">-{formatCurrency(seller.totalRemove)}</span>
                  <span className={`font-medium ${seller.netTotal >= 0 ? 'text-[#2DD4BF]' : 'text-red-400'}`}>
                    {formatCurrency(seller.netTotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[10px] sm:text-xs font-bold text-slate-300 mb-2">
          Historico de Transacoes ({salesData.length})
        </h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs mt-2">Carregando...</p>
          </div>
        ) : salesData.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-4">Nenhuma transacao encontrada para este periodo.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-1 text-[10px] sm:text-xs font-medium">Data/Hora</th>
                  <th className="pb-1 text-[10px] sm:text-xs font-medium">Vendedor</th>
                  <th className="pb-1 text-[10px] sm:text-xs font-medium">Tipo</th>
                  <th className="pb-1 text-[10px] sm:text-xs font-medium text-right">Valor</th>
                  <th className="pb-1 text-[10px] sm:text-xs font-medium text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {salesData.slice(0, 50).map((sale) => {
                  const isCancelled = sale.status === 'cancelled'
                  const isCancellation = sale.type === 'cancellation'
                  const isAdd = sale.type === 'add' && !isCancelled
                  
                  return (
                    <tr 
                      key={sale.id} 
                      className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${
                        isCancelled ? 'opacity-50' : ''
                      } ${isCancellation ? 'bg-orange-500/5' : ''}`}
                    >
                      <td className="py-1.5 text-[10px] sm:text-xs text-slate-300">
                        {formatDate(sale.timestamp)}
                      </td>
                      <td className={`py-1.5 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none ${
                        isCancelled ? 'text-slate-500 line-through' : 'text-white'
                      }`}>
                        {sale.sellerName}
                      </td>
                      <td className="py-1.5">
                        {isCancelled ? (
                          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-slate-600/20 text-slate-500 line-through">
                            Cancelada
                          </span>
                        ) : isCancellation ? (
                          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                            Cancelamento
                          </span>
                        ) : sale.type === 'add' ? (
                          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                            + Venda
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                            - Remocao
                          </span>
                        )}
                      </td>
                      <td className={`py-1.5 text-[10px] sm:text-xs text-right font-medium ${
                        isCancelled ? 'text-slate-500 line-through' :
                        sale.type === 'add' ? 'text-green-400' : 
                        isCancellation ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {sale.type === 'add' ? '+' : '-'}{formatCurrency(sale.value)}
                      </td>
                      <td className="py-2 text-right">
                        {isAdd && (
                          <button
                            onClick={() => handleCancelSale(sale)}
                            disabled={cancellingId === sale.id}
                            className="px-3 py-1.5 text-xs bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-orange-500/30 font-medium"
                          >
                            {cancellingId === sale.id ? (
                              <span className="flex items-center gap-1.5">
                                <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                ...
                              </span>
                            ) : (
                              'Cancelar'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {salesData.length > 50 && (
              <p className="text-slate-500 text-[10px] sm:text-xs text-center py-2">
                Mostrando 50 de {salesData.length} transacoes
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
import { useState } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

function formatDateOnly(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function ExportReport({ sellers, salesHistory, teamGoal, period }) {
  const [exporting, setExporting] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const getFilteredSales = () => {
    const today = new Date()
    const activeSales = salesHistory.filter(s => s.status !== 'cancelled')
    
    if (period === 'daily') {
      const startOfDay = new Date(today)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)
      
      return activeSales.filter(s => {
        const saleDate = new Date(s.timestamp)
        return saleDate >= startOfDay && saleDate <= endOfDay
      })
    } else if (period === 'monthly') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
      
      return activeSales.filter(s => {
        const saleDate = new Date(s.timestamp)
        return saleDate >= startOfMonth && saleDate <= endOfMonth
      })
    } else {
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
      
      return activeSales.filter(s => {
        const saleDate = new Date(s.timestamp)
        return saleDate >= startOfYear && saleDate <= endOfYear
      })
    }
  }

  const getSellerSummary = () => {
    const filteredSales = getFilteredSales()
    
    return sellers.map(seller => {
      const sellerSales = filteredSales.filter(s => s.sellerId === seller.id)
      const adds = sellerSales.filter(s => s.type === 'add')
      const removes = sellerSales.filter(s => s.type === 'remove')
      const cancellations = sellerSales.filter(s => s.type === 'cancellation')
      
      const totalAdded = adds.reduce((sum, s) => sum + (s.value || 0), 0)
      const totalRemoved = removes.reduce((sum, s) => sum + (s.value || 0), 0)
      const totalCancelled = cancellations.reduce((sum, s) => sum + (s.value || 0), 0)
      const netTotal = totalAdded - totalRemoved - totalCancelled
      
      const goal = period === 'daily' ? seller.dailyGoal : 
                   period === 'monthly' ? seller.monthlyGoal : seller.annualGoal
      const percentage = goal > 0 ? Math.min((netTotal / goal) * 100, 100) : 0
      
      return {
        name: seller.name,
        goal: goal,
        totalAdded,
        totalRemoved,
        totalCancelled,
        netTotal,
        percentage: Math.round(percentage),
        transactionCount: sellerSales.length,
      }
    })
  }

  const exportToExcel = () => {
    setExporting('excel')
    try {
      const summary = getSellerSummary()
      const filteredSales = getFilteredSales()
      
      const wb = XLSX.utils.book_new()
      
      const summaryData = summary.map(s => ({
        'Vendedor': s.name,
        'Meta': s.goal,
        'Total Adicionado': s.totalAdded,
        'Total Removido': s.totalRemoved,
        'Cancelamentos': s.totalCancelled,
        'Saldo Liquido': s.netTotal,
        'Atingimento (%)': s.percentage,
        'Transacoes': s.transactionCount,
      }))
      
      const teamTotal = summary.reduce((sum, s) => sum + s.netTotal, 0)
      const teamGoalValue = period === 'daily' ? teamGoal.daily : 
                           period === 'monthly' ? teamGoal.monthly : teamGoal.annual
      const teamPercentage = teamGoalValue > 0 ? Math.round((teamTotal / teamGoalValue) * 100) : 0
      
      summaryData.push({
        'Vendedor': '--- TOTAL EQUIPE ---',
        'Meta': teamGoalValue,
        'Total Adicionado': summary.reduce((sum, s) => sum + s.totalAdded, 0),
        'Total Removido': summary.reduce((sum, s) => sum + s.totalRemoved, 0),
        'Cancelamentos': summary.reduce((sum, s) => sum + s.totalCancelled, 0),
        'Saldo Liquido': teamTotal,
        'Atingimento (%)': teamPercentage,
        'Transacoes': summary.reduce((sum, s) => sum + s.transactionCount, 0),
      })
      
      const wsSummary = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo por Vendedor')
      
      const historyData = filteredSales.map(s => ({
        'Data/Hora': formatDate(s.timestamp),
        'Vendedor': s.sellerName,
        'Tipo': s.type === 'add' ? 'Venda' : s.type === 'remove' ? 'Remocao' : 'Cancelamento',
        'Valor': s.value,
        'Status': s.status === 'cancelled' ? 'Cancelada' : 'Ativa',
      }))
      
      const wsHistory = XLSX.utils.json_to_sheet(historyData)
      XLSX.utils.book_append_sheet(wb, wsHistory, 'Historico de Transacoes')
      
      const periodLabel = period === 'daily' ? 'Diario' : period === 'monthly' ? 'Mensal' : 'Anual'
      const dateLabel = new Date().toLocaleDateString('pt-BR')
      XLSX.writeFile(wb, `Relatorio_${periodLabel}_${dateLabel.replace(/\//g, '-')}.xlsx`)
    } catch (err) {
      console.error('Erro ao exportar Excel:', err)
      alert('Erro ao exportar: ' + err.message)
    } finally {
      setExporting(null)
    }
  }

  const exportToPDF = () => {
    setExporting('pdf')
    try {
      const doc = new jsPDF()
      const summary = getSellerSummary()
      const filteredSales = getFilteredSales()
      
      const periodLabel = period === 'daily' ? 'Diario' : period === 'monthly' ? 'Mensal' : 'Anual'
      const dateLabel = new Date().toLocaleDateString('pt-BR')
      
      doc.setFontSize(18)
      doc.setTextColor(45, 212, 191)
      doc.text('Painel de Metas - Innovate', 14, 22)
      
      doc.setFontSize(12)
      doc.setTextColor(100, 116, 139)
      doc.text(`Relatorio ${periodLabel} - ${dateLabel}`, 14, 30)
      
      const teamTotal = summary.reduce((sum, s) => sum + s.netTotal, 0)
      const teamGoalValue = period === 'daily' ? teamGoal.daily : 
                           period === 'monthly' ? teamGoal.monthly : teamGoal.annual
      const teamPercentage = teamGoalValue > 0 ? Math.round((teamTotal / teamGoalValue) * 100) : 0
      
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Meta da Equipe: ${formatCurrency(teamGoalValue)}`, 14, 40)
      doc.text(`Total Vendido: ${formatCurrency(teamTotal)}`, 14, 46)
      doc.text(`Atingimento: ${teamPercentage}%`, 14, 52)
      
      const tableData = summary.map(s => [
        s.name,
        formatCurrency(s.goal),
        formatCurrency(s.totalAdded),
        formatCurrency(s.totalRemoved),
        formatCurrency(s.totalCancelled),
        formatCurrency(s.netTotal),
        `${s.percentage}%`,
      ])
      
      tableData.push([
        'TOTAL EQUIPE',
        formatCurrency(teamGoalValue),
        formatCurrency(summary.reduce((sum, s) => sum + s.totalAdded, 0)),
        formatCurrency(summary.reduce((sum, s) => sum + s.totalRemoved, 0)),
        formatCurrency(summary.reduce((sum, s) => sum + s.totalCancelled, 0)),
        formatCurrency(teamTotal),
        `${teamPercentage}%`,
      ])
      
      doc.autoTable({
        startY: 60,
        head: [['Vendedor', 'Meta', 'Adicionado', 'Removido', 'Cancelado', 'Liquido', 'Ating.']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [45, 212, 191] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 15 },
        },
      })
      
      const recentSales = filteredSales.slice(0, 20).map(s => [
        formatDateOnly(s.timestamp),
        s.sellerName,
        s.type === 'add' ? 'Venda' : s.type === 'remove' ? 'Remocao' : 'Cancelamento',
        formatCurrency(s.value),
        s.status === 'cancelled' ? 'Cancelada' : 'Ativa',
      ])
      
      if (recentSales.length > 0) {
        doc.addPage()
        doc.setFontSize(14)
        doc.setTextColor(45, 212, 191)
        doc.text('Historico de Transacoes', 14, 22)
        
        doc.autoTable({
          startY: 30,
          head: [['Data', 'Vendedor', 'Tipo', 'Valor', 'Status']],
          body: recentSales,
          theme: 'grid',
          headStyles: { fillColor: [45, 212, 191] },
          styles: { fontSize: 8 },
        })
      }
      
      doc.save(`Relatorio_${periodLabel}_${dateLabel.replace(/\//g, '-')}.pdf`)
    } catch (err) {
      console.error('Erro ao exportar PDF:', err)
      alert('Erro ao exportar: ' + err.message)
    } finally {
      setExporting(null)
    }
  }

  const summary = getSellerSummary()
  const teamTotal = summary.reduce((sum, s) => sum + s.netTotal, 0)
  const teamGoalValue = period === 'daily' ? teamGoal.daily : 
                       period === 'monthly' ? teamGoal.monthly : teamGoal.annual
  const teamPercentage = teamGoalValue > 0 ? Math.round((teamTotal / teamGoalValue) * 100) : 0

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
          <span>📋</span>
          Relatorios Exportaveis
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1.5 text-[10px] sm:text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
          >
            {showPreview ? 'Ocultar' : 'Visualizar'}
          </button>
          <button
            onClick={exportToExcel}
            disabled={exporting === 'excel'}
            className="px-3 py-1.5 text-[10px] sm:text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting === 'excel' ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <span>📊</span>
                Excel
              </>
            )}
          </button>
          <button
            onClick={exportToPDF}
            disabled={exporting === 'pdf'}
            className="px-3 py-1.5 text-[10px] sm:text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting === 'pdf' ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <span>📄</span>
                PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Periodo</p>
          <p className="text-white font-bold text-sm">
            {period === 'daily' ? 'Diario' : period === 'monthly' ? 'Mensal' : 'Anual'}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Meta</p>
          <p className="text-[#2DD4BF] font-bold text-sm">{formatCurrency(teamGoalValue)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Total Vendido</p>
          <p className="text-white font-bold text-sm">{formatCurrency(teamTotal)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Atingimento</p>
          <p className={`font-bold text-sm ${teamPercentage >= 100 ? 'text-green-400' : teamPercentage >= 80 ? 'text-[#2DD4BF]' : 'text-slate-300'}`}>
            {teamPercentage}%
          </p>
        </div>
      </div>

      {showPreview && (
        <div className="mb-4">
          <h3 className="text-[10px] sm:text-xs font-bold text-slate-300 mb-2">Preview do Relatorio</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Vendedor</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Meta</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Vendas</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Cancelado</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Liquido</th>
                  <th className="pb-2 text-[10px] sm:text-xs font-medium">Ating.</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((seller, index) => (
                  <tr key={index} className="border-b border-slate-800/50">
                    <td className="py-2 text-[10px] sm:text-xs text-white">{seller.name}</td>
                    <td className="py-2 text-[10px] sm:text-xs text-slate-300">{formatCurrency(seller.goal)}</td>
                    <td className="py-2 text-[10px] sm:text-xs text-green-400">{formatCurrency(seller.totalAdded)}</td>
                    <td className="py-2 text-[10px] sm:text-xs text-orange-400">{formatCurrency(seller.totalCancelled)}</td>
                    <td className={`py-2 text-[10px] sm:text-xs font-medium ${seller.netTotal >= 0 ? 'text-[#2DD4BF]' : 'text-red-400'}`}>
                      {formatCurrency(seller.netTotal)}
                    </td>
                    <td className="py-2 text-[10px] sm:text-xs text-slate-300">{seller.percentage}%</td>
                  </tr>
                ))}
                <tr className="bg-slate-800/30 font-bold">
                  <td className="py-2 text-[10px] sm:text-xs text-white">TOTAL EQUIPE</td>
                  <td className="py-2 text-[10px] sm:text-xs text-slate-300">{formatCurrency(teamGoalValue)}</td>
                  <td className="py-2 text-[10px] sm:text-xs text-green-400">{formatCurrency(summary.reduce((sum, s) => sum + s.totalAdded, 0))}</td>
                  <td className="py-2 text-[10px] sm:text-xs text-orange-400">{formatCurrency(summary.reduce((sum, s) => sum + s.totalCancelled, 0))}</td>
                  <td className={`py-2 text-[10px] sm:text-xs ${teamTotal >= 0 ? 'text-[#2DD4BF]' : 'text-red-400'}`}>{formatCurrency(teamTotal)}</td>
                  <td className="py-2 text-[10px] sm:text-xs text-white">{teamPercentage}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
        <p className="text-slate-400 text-[10px] sm:text-xs">
          <span className="text-white font-medium">Planilha Excel:</span> Inclui resumo por vendedor + historico de transacoes detalhado.
        </p>
        <p className="text-slate-400 text-[10px] sm:text-xs mt-1">
          <span className="text-white font-medium">PDF:</span> Relatorio formatado com graficos e tabelas para impressao.
        </p>
      </div>
    </div>
  )
}
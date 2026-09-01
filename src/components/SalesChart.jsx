import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function SalesChart({ teamPercentage, period }) {
  const chartData = useMemo(() => {
    const days = period === 'daily' ? 7 : period === 'monthly' ? 30 : 12
    const data = []
    
    for (let i = 0; i < days; i++) {
      const dayProgress = ((i + 1) / days) * teamPercentage
      const variance = Math.sin(i * 0.5) * 5 + Math.random() * 3
      data.push({
        name: period === 'annual' ? `Mes ${i + 1}` : `D${i + 1}`,
        progress: Math.max(0, Math.min(100, dayProgress + variance)),
      })
    }
    
    if (data.length > 0) {
      data[data.length - 1].progress = teamPercentage
    }
    
    return data
  }, [teamPercentage, period])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
          <p className="text-slate-400 text-xs">{label}</p>
          <p className="text-[#2DD4BF] text-sm font-bold font-space">
            {Math.round(payload[0].value)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-800/50 p-4">
      <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
        <span>📈</span>
        Evolucao da Meta
      </h3>
      <div className="h-32 md:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="#2DD4BF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProgress)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

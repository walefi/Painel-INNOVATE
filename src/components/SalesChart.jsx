import { useMemo, useState } from 'react'

export function SalesChart({ teamPercentage, period }) {
  const [tooltip, setTooltip] = useState(null)

  const chartData = useMemo(() => {
    const days = period === 'daily' ? 7 : period === 'monthly' ? 30 : 12
    const data = []

    for (let i = 0; i < days; i++) {
      const dayProgress = ((i + 1) / days) * teamPercentage
      const variance = Math.sin(i * 0.5) * 5
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

  const width = 600
  const height = 160
  const padX = 30
  const padY = 10
  const chartW = width - padX - 10
  const chartH = height - padY - 20

  const points = chartData.map((d, i) => ({
    x: padX + (i / (chartData.length - 1)) * chartW,
    y: padY + chartH - (d.progress / 100) * chartH,
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`

  // Y-axis ticks
  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-800/50 p-4">
      <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
        <span>📈</span>
        Evolucao da Meta
      </h3>
      <div className="h-32 md:h-40">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = padY + chartH - (tick / 100) * chartH
            return (
              <g key={tick}>
                <line x1={padX} y1={y} x2={padX + chartW} y2={y} stroke="#334155" strokeWidth={0.5} strokeDasharray="3,3" />
                <text x={padX - 4} y={y + 3} textAnchor="end" fill="#64748b" fontSize={9}>
                  {tick}%
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaFill)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#2DD4BF" strokeWidth={2} strokeLinejoin="round" />

          {/* Data points and labels */}
          {points.map((p, i) => {
            const showLabel = chartData.length <= 12 || i % 5 === 0 || i === points.length - 1
            return (
              <g
                key={i}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, name: p.name, value: Math.round(p.progress) })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={p.x} cy={p.y} r={3} fill="#2DD4BF" stroke="#0f172a" strokeWidth={1.5} />
                <rect x={p.x - 10} y={p.y - 15} width={20} height={20} fill="transparent" />
                {showLabel && (
                  <text x={p.x} y={height - 4} textAnchor="middle" fill="#64748b" fontSize={8}>
                    {p.name}
                  </text>
                )}
              </g>
            )
          })}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect
                x={tooltip.x - 30}
                y={tooltip.y - 30}
                width={60}
                height={22}
                rx={4}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth={1}
              />
              <text x={tooltip.x} y={tooltip.y - 15} textAnchor="middle" fill="#2DD4BF" fontSize={10} fontWeight="bold">
                {tooltip.value}% — {tooltip.name}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

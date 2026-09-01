import CountUp from 'react-countup'

export function AnimatedNumber({ value, format = 'currency', className = '', duration = 2 }) {
  const formatCurrency = (val) => `R$ ${val.toLocaleString('pt-BR')}`

  return (
    <span className={`font-space ${className}`}>
      <CountUp
        start={0}
        end={value}
        duration={duration}
        separator="."
        formattingFn={format === 'currency' ? formatCurrency : undefined}
      />
      {format === 'percent' && '%'}
    </span>
  )
}

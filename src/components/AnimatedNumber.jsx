import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

export function AnimatedNumber({ value, format = 'currency', className = '', duration = 2000 }) {
  const animatedValue = useAnimatedNumber(value, duration)

  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(val)
      case 'percent':
        return `${Math.round(val)}%`
      default:
        return new Intl.NumberFormat('pt-BR').format(val)
    }
  }

  return (
    <span className={`font-space ${className}`}>
      {formatValue(animatedValue)}
    </span>
  )
}

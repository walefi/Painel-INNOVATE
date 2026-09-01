import { useState, useEffect, useRef, useCallback } from 'react'

const COLORS = ['#2DD4BF', '#E8A33D', '#ff8c00', '#22c55e', '#3b82f6', '#a855f7']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export function ConfettiTrigger({ teamPercentage }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)

  useEffect(() => {
    if (teamPercentage >= 100 && !hasTriggered) {
      setShowConfetti(true)
      setHasTriggered(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
    if (teamPercentage < 100) {
      setHasTriggered(false)
    }
  }, [teamPercentage, hasTriggered])

  const createParticles = useCallback((width, height) => {
    const particles = []
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: randomBetween(0, width),
        y: randomBetween(-height, 0),
        w: randomBetween(6, 12),
        h: randomBetween(4, 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: randomBetween(-2, 2),
        vy: randomBetween(2, 6),
        rotation: randomBetween(0, 360),
        rotationSpeed: randomBetween(-10, 10),
        opacity: 1,
      })
    }
    return particles
  }, [])

  useEffect(() => {
    if (!showConfetti || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    particlesRef.current = createParticles(canvas.width, canvas.height)
    let startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let aliveCount = 0
      particlesRef.current.forEach((p) => {
        if (p.opacity <= 0) return
        aliveCount++

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.rotation += p.rotationSpeed

        if (elapsed > 4000) {
          p.opacity -= 0.02
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })

      if (aliveCount > 0) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [showConfetti, createParticles])

  if (!showConfetti) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}

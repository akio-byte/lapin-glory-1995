import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
}

const createParticle = (width: number, height: number): Particle => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: 1.5 + Math.random() * 1.5,
  speedX: Math.random() * 0.4 - 0.2,
  speedY: Math.random() * 0.4 - 0.2,
})

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let animationFrame: number
    const particles: Particle[] = []
    const maxDistance = 120

    const resize = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window
      const ratio = devicePixelRatio || 1
      canvas.width = innerWidth * ratio
      canvas.height = innerHeight * ratio
      canvas.style.width = `${innerWidth}px`
      canvas.style.height = `${innerHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(ratio, ratio)

      const targetCount = Math.max(80, Math.floor((innerWidth * innerHeight) / 12000))
      particles.length = 0
      for (let i = 0; i < targetCount; i += 1) {
        particles.push(createParticle(innerWidth, innerHeight))
      }
    }

    const drawConnections = () => {
      const { innerWidth, innerHeight } = window
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.6})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)

      particles.forEach((particle) => {
        const next = particle
        next.x += next.speedX
        next.y += next.speedY

        if (next.x > width || next.x < 0) next.speedX *= -1
        if (next.y > height || next.y < 0) next.speedY *= -1

        ctx.fillStyle = '#22d3ee'
        ctx.beginPath()
        ctx.arc(next.x, next.y, next.size, 0, Math.PI * 2)
        ctx.fill()
      })

      drawConnections()
      animationFrame = window.requestAnimationFrame(animate)
    }

    resize()
    animationFrame = window.requestAnimationFrame(animate)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden />
}

export default ParticleBackground

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

// ─────────────────────────────────────────────
// Canvas Particle Network System
// ─────────────────────────────────────────────

function useParticleNetwork(canvasRef) {
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    const NODE_COUNT = 65
    const CONNECTION_DIST = 180
    const MOUSE_RADIUS = 200
    const colors = ['#3b82f6', '#8b5cf6', '#6366f1', '#a78bfa', '#60a5fa']

    // Create nodes
    const nodes = []
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.4 + 0.3,
      })
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      const mouse = mouseRef.current

      // Update & draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Move
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1
        node.x = Math.max(0, Math.min(width, node.x))
        node.y = Math.max(0, Math.min(height, node.y))

        // Mouse interaction — slight pull toward mouse
        const dxM = mouse.x - node.x
        const dyM = mouse.y - node.y
        const distM = Math.sqrt(dxM * dxM + dyM * dyM)
        let mouseGlow = 0
        if (distM < MOUSE_RADIUS) {
          const force = (1 - distM / MOUSE_RADIUS) * 0.015
          node.vx += dxM * force
          node.vy += dyM * force
          mouseGlow = 1 - distM / MOUSE_RADIUS
        }

        // Dampen velocity
        node.vx *= 0.99
        node.vy *= 0.99

        // Draw node
        const alpha = node.baseAlpha + mouseGlow * 0.6
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius + mouseGlow * 2, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = Math.min(alpha, 1)
        ctx.fill()

        // Mouse-proximate glow
        if (mouseGlow > 0.3) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + mouseGlow * 6, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.globalAlpha = mouseGlow * 0.15
          ctx.fill()
        }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = '#6366f1'
            ctx.globalAlpha = alpha
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [canvasRef])
}

// ─────────────────────────────────────────────
// Login Page Component
// ─────────────────────────────────────────────

function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const canvasRef = useRef(null)
  useParticleNetwork(canvasRef)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Login olmuş kullanıcı /login'e gelirse /'e yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Gerçek auth için backend /auth/login endpoint'i kullanılacak
    setTimeout(() => {
      login()
      navigate('/', { replace: true })
    }, 700)
  }, [login, navigate])

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: '#0a0f1c' }}>

      {/* ── Canvas Particle Background ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6, zIndex: 0 }}
      />

      {/* ── Radial Gradient Overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)',
          zIndex: 1,
        }}
      />

      {/* ── Sol-Üst: Marka ── */}
      <div className="absolute top-6 left-8 flex items-center gap-3" style={{ zIndex: 10 }}>
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: '#34d399', borderColor: '#0a0f1c', animation: 'pulse 2s infinite' }} />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">
            ARTech Finance
          </h1>
          <p className="text-[10px] font-medium tracking-wider uppercase mt-0.5"
            style={{ color: '#64748b' }}>
            AML Takip
          </p>
        </div>
      </div>

      {/* ── Sağ-Üst: TEKNOFEST Rozet ── */}
      <div className="absolute top-6 right-8 flex items-center gap-2 px-3 py-1.5 rounded-lg border"
        style={{ zIndex: 10, background: 'rgba(30,41,59,0.5)', borderColor: 'rgba(71,85,105,0.3)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
        <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>
          TEKNOFEST 2026 · Finansal Teknolojiler
        </span>
      </div>

      {/* ── Ortada Login Kartı ── */}
      <div className="relative flex items-center justify-center h-full w-full" style={{ zIndex: 10 }}>
        <div
          className="w-full max-w-md rounded-2xl p-8 transition-all duration-300"
          style={{
            background: 'rgba(15,23,42,0.60)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(71,85,105,0.4)',
            boxShadow: '0 0 60px rgba(59,130,246,0.08), 0 25px 50px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 0 80px rgba(59,130,246,0.15), 0 30px 60px rgba(0,0,0,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 0 60px rgba(59,130,246,0.08), 0 25px 50px rgba(0,0,0,0.4)'
          }}
        >
          {/* İkon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.2)' }}>
              <ShieldCheck className="w-7 h-7" style={{ color: '#818cf8' }} />
            </div>
          </div>

          {/* Başlık */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Denetçi Paneli Girişi
            </h2>
            <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
              Hesabınıza erişmek için giriş yapın
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail className="w-4 h-4" style={{ color: emailFocused ? '#818cf8' : '#475569' , transition: 'color 0.2s' }} />
              </div>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                aria-label="E-posta adresi"
                placeholder=" "
                className="peer w-full pl-10 pr-4 pt-5 pb-2 rounded-xl text-sm text-white outline-none transition-all duration-200"
                style={{
                  background: 'rgba(30,41,59,0.5)',
                  border: emailFocused
                    ? '1px solid rgba(99,102,241,0.6)'
                    : '1px solid rgba(71,85,105,0.3)',
                  boxShadow: emailFocused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                }}
              />
              <label
                htmlFor="login-email"
                className="absolute left-10 transition-all duration-200 pointer-events-none"
                style={{
                  top: email || emailFocused ? '6px' : '50%',
                  transform: email || emailFocused ? 'translateY(0)' : 'translateY(-50%)',
                  fontSize: email || emailFocused ? '10px' : '14px',
                  color: emailFocused ? '#818cf8' : '#64748b',
                  fontWeight: email || emailFocused ? '600' : '400',
                  letterSpacing: email || emailFocused ? '0.02em' : '0',
                }}
              >
                E-posta
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-4 h-4" style={{ color: passwordFocused ? '#818cf8' : '#475569', transition: 'color 0.2s' }} />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                aria-label="Şifre"
                placeholder=" "
                className="peer w-full pl-10 pr-12 pt-5 pb-2 rounded-xl text-sm text-white outline-none transition-all duration-200"
                style={{
                  background: 'rgba(30,41,59,0.5)',
                  border: passwordFocused
                    ? '1px solid rgba(99,102,241,0.6)'
                    : '1px solid rgba(71,85,105,0.3)',
                  boxShadow: passwordFocused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                }}
              />
              <label
                htmlFor="login-password"
                className="absolute left-10 transition-all duration-200 pointer-events-none"
                style={{
                  top: password || passwordFocused ? '6px' : '50%',
                  transform: password || passwordFocused ? 'translateY(0)' : 'translateY(-50%)',
                  fontSize: password || passwordFocused ? '10px' : '14px',
                  color: passwordFocused ? '#818cf8' : '#64748b',
                  fontWeight: password || passwordFocused ? '600' : '400',
                  letterSpacing: password || passwordFocused ? '0.02em' : '0',
                }}
              >
                Şifre
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors duration-200"
                style={{ color: '#64748b' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only peer"
                    aria-label="Beni hatırla"
                  />
                  <div className="w-4 h-4 rounded transition-all duration-200 peer-checked:border-0"
                    style={{
                      border: remember ? 'none' : '1.5px solid rgba(71,85,105,0.5)',
                      background: remember ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                    }}>
                    {remember && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs group-hover:text-slate-300 transition-colors" style={{ color: '#94a3b8' }}>
                  Beni hatırla
                </span>
              </label>
              <button type="button" className="text-xs font-medium transition-colors duration-200"
                style={{ color: '#818cf8' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#a5b4fc'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#818cf8'}>
                Şifremi unuttum
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: isLoading
                  ? 'linear-gradient(135deg, #4b5563, #374151)'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: isLoading
                  ? 'none'
                  : '0 4px 20px rgba(59,130,246,0.3), 0 0 40px rgba(139,92,246,0.1)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = '0 4px 30px rgba(59,130,246,0.5), 0 0 60px rgba(139,92,246,0.2)'
                  e.currentTarget.style.transform = 'scale(1.01)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.3), 0 0 40px rgba(139,92,246,0.1)'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
              onMouseDown={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'scale(0.95)'
              }}
              onMouseUp={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'scale(1.01)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Demo Notu */}
          <p className="text-center mt-6 italic" style={{ fontSize: '11px', color: '#475569' }}>
            Demo Modu: Herhangi bir email/şifre ile giriş yapabilirsiniz
          </p>
        </div>
      </div>

      {/* ── Alt: Copyright ── */}
      <div className="absolute bottom-6 left-0 right-0 text-center" style={{ zIndex: 10 }}>
        <p className="text-[11px]" style={{ color: '#334155' }}>
          © 2026 ARTech Finance · TEKNOFEST 2026
        </p>
      </div>
    </div>
  )
}

export default Login

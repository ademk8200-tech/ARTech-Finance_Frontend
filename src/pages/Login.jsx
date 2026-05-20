import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const numParticles = 50;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.radius = Math.random() * 2 + 1;
        this.color = '#ffffff';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 120})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate 700ms loading
    setTimeout(() => {
      login();
      setIsLoading(false);
      navigate('/');
    }, 700);
  };

  const shimmerStyle = `
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
  `;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans text-slate-200">
      <style>{shimmerStyle}</style>

      {/* Canvas Animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 z-0 pointer-events-none" />



      {/* Top Left Brand */}
      <div className="absolute top-6 left-8 flex items-center gap-2 z-10">
        <div className="w-8 h-8 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wide text-white">ARTech Finance</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">AML Takip Sistemi</p>
        </div>
      </div>

      {/* Top Right Badge */}
      <div className="absolute top-6 right-8 z-10">
        <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs font-semibold text-slate-300 shadow-sm backdrop-blur-sm">
          TEKNOFEST 2026
        </span>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-white/5 hover:bg-white/[0.05] hover:-translate-y-[2px] transition-all duration-300">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">

            <div className="text-center mb-2">
              <span className="block text-xs text-white/40 tracking-[0.3em] font-semibold mb-2">ARTECH FINANCE</span>
              <h2 className="text-3xl font-serif italic text-white">Panel Girişi</h2>
            </div>
            <p className="text-sm text-white/50 text-center">Hesabınıza erişmek için giriş yapın</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">E-posta Adresi</label>
              <div className="relative">
                {!email && (
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/40 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Şifre</label>
              <div className="relative">
                {!password && (
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                )}
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/40 transition-all duration-300"
                  required
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer">
                  Beni hatırla
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-white/60 hover:text-white transition-colors">
                  Şifremi unuttum
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-white hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-6 group"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:hidden bg-gradient-to-r from-transparent via-black/10 to-transparent" style={{ animation: 'shimmer 3s infinite linear' }}></div>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

        </div>

        {/* Demo Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs font-medium text-white/40">
              <strong className="text-white/60">Demo Modu:</strong> Herhangi bir e-posta ve şifre ile giriş yapabilirsiniz.
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center z-10">
        <p className="text-xs text-slate-500">
          © 2026 ARTech Finance · TEKNOFEST 2026
        </p>
      </div>

    </div>
  );
};

export default Login;

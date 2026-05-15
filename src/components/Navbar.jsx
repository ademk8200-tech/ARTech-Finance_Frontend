import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, User, ChevronDown, ShieldCheck, LayoutDashboard, ArrowLeftRight, Network, FileBarChart, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/transactions',
    label: 'İşlemler',
    icon: ArrowLeftRight,
  },
  {
    to: '/network',
    label: 'Ağ Analizi',
    icon: Network,
  },
  {
    to: '/reports',
    label: 'Raporlar',
    icon: FileBarChart,
  },
]

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-[72px] bg-[#0b1120] border-b border-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-between px-6 shrink-0 z-50">

      {/* ── Sol: Logo ve Proje Adı ── */}
      <div className="flex items-center gap-3 w-auto md:w-[260px] shrink-0">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0b1120] animate-pulse" />
        </div>
        <div className="hidden sm:block overflow-hidden whitespace-nowrap">
          <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">
            ARTech Finance
          </h1>
          <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
            AML Takip
          </p>
        </div>
      </div>

      {/* ── Orta: Navigasyon Linkleri ── */}
      <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
        {navItems.map((item) => {
          const isTransactionDetail = item.to === '/transactions' && location.pathname.startsWith('/transactions/')
          const isActive = location.pathname === item.to || isTransactionDetail
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                isActive ? 'text-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-t-full" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Sağ: Arama + Bildirim + Kullanıcı ── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Arama */}
        <div className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800/70 rounded-lg px-3 py-2 border border-slate-700/30 transition-colors duration-200 group">
          <Search className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
          <input
            type="text"
            placeholder="Ara…"
            className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-600 w-24 lg:w-48 focus:placeholder-slate-500"
          />
          <kbd className="text-[10px] text-slate-600 bg-slate-800 border border-slate-700/50 px-1.5 py-0.5 rounded font-mono hidden xl:inline-block">
            ⌘K
          </kbd>
        </div>

        {/* Bildirimler */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800/60 transition-all duration-200 text-slate-500 hover:text-slate-300 group">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0b1120] shadow-lg shadow-red-500/30">
            3
          </span>
        </button>

        {/* Ayırıcı */}
        <div className="w-px h-8 bg-slate-800/60 hidden sm:block" />

        {/* Kullanıcı */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-slate-800/40 transition-all duration-200 group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/15">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0b1120]" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-[12px] text-slate-300 font-medium leading-tight group-hover:text-white transition-colors">
                Uyum Analisti
              </p>
              <p className="text-[10px] text-slate-600 leading-tight">Yönetici</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-all duration-200 hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0b1120] border border-slate-700/50 rounded-xl shadow-xl shadow-black/50 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-800/60 mb-1">
                <p className="text-sm font-medium text-white">Profil</p>
                <p className="text-xs text-slate-400 truncate">demo@artech.finance</p>
              </div>
              
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                <User className="w-4 h-4 text-slate-400" />
                Hesabım
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                <Settings className="w-4 h-4 text-slate-400" />
                Ayarlar
              </button>
              
              <div className="h-px bg-slate-800/60 my-1.5" />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400/70" />
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar

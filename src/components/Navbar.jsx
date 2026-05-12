import { useLocation } from 'react-router-dom'
import { Bell, Search, User, ChevronDown, ShieldAlert, Menu } from 'lucide-react'

const pageTitles = {
  '/': 'Dashboard',
  '/transactions': 'İşlemler',
  '/network': 'Ağ Analizi',
  '/reports': 'Raporlar',
}

function Navbar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation()

  const getTitle = () => {
    if (location.pathname.startsWith('/transactions/')) {
      return 'İşlem Detayı'
    }
    return pageTitles[location.pathname] || 'Sayfa'
  }

  const getBreadcrumb = () => {
    if (location.pathname.startsWith('/transactions/')) {
      return ['İşlemler', 'Detay']
    }
    return null
  }

  const breadcrumb = getBreadcrumb()

  return (
    <header className="h-[64px] bg-[#0d1526]/90 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 sticky top-0 z-40">

      {/* ── Sol: Hamburger Butonu + Proje Adı + Sayfa Başlığı ── */}
      <div className="flex items-center gap-4">
        {/* Toggle Butonu */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Proje Adı */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-800/60">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <span className="text-[11px] text-slate-500 font-medium tracking-wide hidden xl:inline">
            Yapay Zeka Tabanlı Dinamik Kara Para Takip Sistemi
          </span>
          <span className="text-[11px] text-slate-500 font-medium tracking-wide xl:hidden">
            AML Takip
          </span>
        </div>

        {/* Sayfa Başlığı veya Breadcrumb */}
        <div className="flex items-center gap-2">
          {breadcrumb ? (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-500">{breadcrumb[0]}</span>
              <span className="text-slate-700">/</span>
              <span className="text-white font-semibold">{breadcrumb[1]}</span>
            </div>
          ) : (
            <h2 className="text-[15px] font-semibold text-white">{getTitle()}</h2>
          )}
        </div>
      </div>

      {/* ── Sağ: Arama + Bildirim + Kullanıcı ── */}
      <div className="flex items-center gap-3">

        {/* Arama */}
        <div className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800/70 rounded-lg px-3 py-2 border border-slate-700/30 transition-colors duration-200 group">
          <Search className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
          <input
            type="text"
            placeholder="İşlem, hesap veya kişi ara…"
            className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-600 w-56 focus:placeholder-slate-500"
          />
          <kbd className="text-[10px] text-slate-600 bg-slate-800 border border-slate-700/50 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Bildirimler */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800/60 transition-all duration-200 text-slate-500 hover:text-slate-300 group">
          <Bell className="w-[18px] h-[18px]" />
          {/* Bildirim sayısı */}
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0d1526] shadow-lg shadow-red-500/30">
            3
          </span>
        </button>

        {/* Ayırıcı */}
        <div className="w-px h-8 bg-slate-800/60" />

        {/* Kullanıcı */}
        <button className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-slate-800/40 transition-all duration-200 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/15">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d1526]" />
          </div>
          <div className="text-left">
            <p className="text-[12px] text-slate-300 font-medium leading-tight group-hover:text-white transition-colors">
              Uyum Analisti
            </p>
            <p className="text-[10px] text-slate-600 leading-tight">Yönetici</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
      </div>
    </header>
  )
}

export default Navbar

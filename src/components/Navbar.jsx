import { useLocation } from 'react-router-dom'
import { Bell, Search, User } from 'lucide-react'

const pageTitles = {
  '/': 'Dashboard',
  '/transactions': 'İşlemler',
  '/network': 'Ağ Analizi',
  '/reports': 'Raporlar',
}

function Navbar() {
  const location = useLocation()

  // /transactions/:id gibi alt yollar için başlık belirle
  const getTitle = () => {
    if (location.pathname.startsWith('/transactions/')) {
      return 'İşlem Detayı'
    }
    return pageTitles[location.pathname] || 'Sayfa'
  }

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Sayfa Başlığı */}
      <h2 className="text-lg font-semibold text-white">{getTitle()}</h2>

      {/* Sağ Taraf */}
      <div className="flex items-center gap-4">
        {/* Arama */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700/50">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Ara..."
            className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-500 w-48"
          />
        </div>

        {/* Bildirim */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Kullanıcı */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-slate-300 font-medium">Analist</span>
        </div>
      </div>
    </header>
  )
}

export default Navbar

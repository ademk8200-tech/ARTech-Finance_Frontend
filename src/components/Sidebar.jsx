import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Network,
  FileBarChart,
  Shield,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'İşlemler', icon: ArrowLeftRight },
  { to: '/network', label: 'Ağ Analizi', icon: Network },
  { to: '/reports', label: 'Raporlar', icon: FileBarChart },
]

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">ARTech Finance</h1>
          <p className="text-[10px] text-slate-400">Kara Para Takip Sistemi</p>
        </div>
      </div>

      {/* Navigasyon */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Alt Bilgi */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-500 text-center">
          TEKNOFEST 2026 · v0.1.0
        </p>
      </div>
    </aside>
  )
}

export default Sidebar

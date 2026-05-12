import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Network,
  FileBarChart,
  ShieldCheck,
  Activity,
} from 'lucide-react'

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Genel Bakış',
  },
  {
    to: '/transactions',
    label: 'İşlemler',
    icon: ArrowLeftRight,
    description: 'İşlem Takibi',
  },
  {
    to: '/network',
    label: 'Ağ Analizi',
    icon: Network,
    description: 'Bağlantı Haritası',
  },
  {
    to: '/reports',
    label: 'Raporlar',
    icon: FileBarChart,
    description: 'SAR & STR',
  },
]

function Sidebar({ isCollapsed }) {
  const location = useLocation()

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen w-[260px] bg-gradient-to-b from-[#0b1120] to-[#0f1729] border-r border-slate-800/60 flex flex-col z-50 transition-transform duration-300 ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}
    >
      {/* ── Logo Alanı ── */}
      <div className="pt-6 pb-5 px-5 flex flex-col justify-center">
        <div className="flex items-center gap-3 w-full">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {/* Canlı sinyal noktası */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0b1120] animate-pulse" />
          </div>
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">
              ARTech Finance
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
              AML Takip
            </p>
          </div>
        </div>
      </div>

      {/* ── Ayırıcı ── */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* ── Sistem Durumu ── */}
      <div className="mx-5 mt-4 mb-2">
        <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/15 flex items-center px-3 py-2.5 gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-emerald-400 font-semibold whitespace-nowrap">Sistem Aktif</span>
          <span className="ml-auto text-[10px] text-emerald-500/70 font-mono whitespace-nowrap">Canlı</span>
        </div>
      </div>

      {/* ── Menü Başlığı ── */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] text-slate-600 font-semibold tracking-[0.15em] uppercase whitespace-nowrap overflow-hidden text-ellipsis">
          Ana Menü
        </p>
      </div>

      {/* ── Navigasyon ── */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3">
        {navItems.map((item) => {
          const isTransactionDetail =
            item.to === '/transactions' &&
            location.pathname.startsWith('/transactions/')

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => {
                const active = isActive || isTransactionDetail
                return [
                  'group flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 relative',
                  'gap-3 px-3 py-2.5',
                  active
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300',
                ].join(' ')
              }}
            >
              {({ isActive }) => {
                const active = isActive || isTransactionDetail
                return (
                  <>
                    {/* Aktif sayfa göstergesi — sol kenar çizgisi */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500 shadow-md shadow-blue-500/40" />
                    )}

                    <div
                      className={[
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                        active
                          ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/10'
                          : 'bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-400',
                      ].join(' ')}
                    >
                      <item.icon className="w-[16px] h-[16px]" />
                    </div>

                    <div className="flex flex-col whitespace-nowrap overflow-hidden">
                      <span className="leading-tight">{item.label}</span>
                      <span
                        className={[
                          'text-[10px] leading-tight mt-0.5 transition-colors duration-200',
                          active ? 'text-blue-500/60' : 'text-slate-700 group-hover:text-slate-600',
                        ].join(' ')}
                      >
                        {item.description}
                      </span>
                    </div>
                  </>
                )
              }}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Alt Bilgi ── */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      <div className="py-4 px-5">
        <div className="flex items-center justify-between w-full">
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-[10px] text-slate-600 font-semibold">TEKNOFEST 2026</p>
            <p className="text-[9px] text-slate-700 mt-0.5">Finansal Teknolojiler</p>
          </div>
          <span className="text-[10px] text-slate-700 font-mono bg-slate-800/50 px-2 py-0.5 rounded shrink-0">
            v0.2.0
          </span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

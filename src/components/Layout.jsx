import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function Layout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a1022]">
      {/* Üst Menü (Navbar) */}
      <Navbar />

      {/* Sayfa İçeriği Alanı (Scrollable) */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-6 h-full">
          <Outlet />
        </div>
      </main>

      {/* Alt Bilgi Çizgisi */}
      <footer className="px-6 py-3 border-t border-slate-800/40 bg-[#080d19] shrink-0">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <p className="text-[10px] text-slate-700">
            © 2026 ARTech Finance — Yapay Zeka Tabanlı Dinamik Kara Para Takip Sistemi
          </p>
          <p className="text-[10px] text-slate-700 font-mono">
            TEKNOFEST 2026 · Finansal Teknolojiler Yarışması
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout

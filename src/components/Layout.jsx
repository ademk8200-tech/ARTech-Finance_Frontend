import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#080d19]">
      {/* Sol Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Ana İçerik Alanı */}
      <div 
        className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'ml-[80px]' : 'ml-[260px]'
        }`}
      >
        <Navbar />

        {/* Sayfa İçeriği */}
        <main className="flex-1 p-6 bg-[#0a1022]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Alt Bilgi Çizgisi */}
        <footer className="px-6 py-3 border-t border-slate-800/40 bg-[#080d19]">
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
    </div>
  )
}

export default Layout

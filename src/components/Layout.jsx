import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sol Sidebar */}
      <Sidebar />

      {/* Ana İçerik */}
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

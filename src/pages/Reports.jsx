import { FileBarChart } from 'lucide-react'

function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileBarChart className="w-6 h-6 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Raporlar</h1>
      </div>
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-8 text-center">
        <p className="text-slate-400 text-sm">
          Bu alan ilerleyen sprintlerde geliştirilecektir.
        </p>
      </div>
    </div>
  )
}

export default Reports

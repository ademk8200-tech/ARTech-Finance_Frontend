import { useParams } from 'react-router-dom'
import { FileText } from 'lucide-react'

function TransactionDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">İşlem Detayı</h1>
        <span className="bg-slate-800 text-slate-400 text-xs font-mono px-3 py-1 rounded-lg border border-slate-700/50">
          ID: {id}
        </span>
      </div>
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-8 text-center">
        <p className="text-slate-400 text-sm">
          Bu alan ilerleyen sprintlerde geliştirilecektir.
        </p>
      </div>
    </div>
  )
}

export default TransactionDetail

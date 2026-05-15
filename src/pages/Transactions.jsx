import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { getTransactions } from '../services/transactionService'

// Helper functions
function formatCurrency(value) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getRiskLevel(score) {
  if (score >= 70) return 'Yüksek'
  if (score >= 40) return 'Orta'
  return 'Düşük'
}

function getRiskColor(score) {
  if (score >= 70) return { text: 'text-red-400', bg: 'bg-red-500/10', bar: 'bg-red-500' }
  if (score >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500' }
  return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' }
}

function getStatusStyle(status) {
  switch (status) {
    case 'Şüpheli':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'İncelemede':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    default:
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }
}

function Transactions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tümü')
  const [riskFilter, setRiskFilter] = useState('Tümü')
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTransactions().then(data => {
      console.log('getTransactions result:', data)
      setTransactions(data || [])
      setLoading(false)
    })
  }, [])

  // Filtering and Sorting logic
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions]

    // 1. Arama Filtresi
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase()
      result = result.filter(
        (txn) =>
          txn.id.toLowerCase().includes(lowercasedSearch) ||
          txn.senderAccount.toLowerCase().includes(lowercasedSearch) ||
          txn.receiverAccount.toLowerCase().includes(lowercasedSearch) ||
          txn.pattern.toLowerCase().includes(lowercasedSearch)
      )
    }

    // 2. Durum Filtresi
    if (statusFilter !== 'Tümü') {
      result = result.filter((txn) => txn.status === statusFilter)
    }

    // 3. Risk Seviyesi Filtresi
    if (riskFilter !== 'Tümü') {
      result = result.filter((txn) => getRiskLevel(txn.riskScore) === riskFilter)
    }

    // 4. Sıralama
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'date') {
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [transactions, searchTerm, statusFilter, riskFilter, sortConfig])

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* ── Başlık ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">İşlemler</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Tüm finansal transferleri ve inceleme durumlarını yönetin
                </p>
              </div>
            </div>
          </div>

          {/* ── Filtreler ve Arama ── */}
          <div className="bg-black border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Arama Kutusu */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40 sm:text-sm transition-colors"
                placeholder="İşlem ID, Hesap No veya Örüntü Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Seçim Filtreleri */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  className="bg-transparent border-none text-sm text-slate-300 focus:ring-0 cursor-pointer outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="Tümü">Tüm Durumlar</option>
                  <option value="Şüpheli">Şüpheli</option>
                  <option value="İncelemede">İncelemede</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <AlertTriangle className="w-4 h-4 text-slate-500" />
                <select
                  className="bg-transparent border-none text-sm text-slate-300 focus:ring-0 cursor-pointer outline-none"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  <option value="Tümü">Tüm Risk Seviyeleri</option>
                  <option value="Yüksek">Yüksek Risk</option>
                  <option value="Orta">Orta Risk</option>
                  <option value="Düşük">Düşük Risk</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Tablo Alanı ── */}
          <div className="bg-black border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">İşlem ID</th>
                    <th className="px-4 py-3 font-medium">Tarih</th>
                    <th className="px-4 py-3 font-medium">Gönderen Hesap</th>
                    <th className="px-4 py-3 font-medium">Alıcı Hesap</th>
                    <th className="px-4 py-3 font-medium text-right pr-8">Tutar</th>
                    <th className="px-4 py-3 font-medium">Tür</th>
                    <th
                      className="px-4 py-3 font-medium cursor-pointer hover:text-slate-300 transition-colors group"
                      onClick={() => handleSort('riskScore')}
                    >
                      <div className="flex items-center gap-1">
                        Risk Skoru
                        <span className="text-slate-600 group-hover:text-slate-400">
                          {sortConfig.key === 'riskScore' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3 font-medium">Örüntü</th>
                    <th className="px-4 py-3 font-medium text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {filteredAndSortedTransactions.length > 0 ? (
                    filteredAndSortedTransactions.map((txn) => {
                      const riskStyle = getRiskColor(txn.riskScore)
                      const isSuspicious = txn.status === 'Şüpheli'

                      return (
                        <tr
                          key={txn.id}
                          className={`hover:bg-white/[0.02] transition-colors group ${isSuspicious ? 'bg-red-500/[0.02]' : ''
                            }`}
                        >
                          {/* İşlem ID */}
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-slate-300">{txn.id}</span>
                          </td>

                          {/* Tarih */}
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {formatDate(txn.date)}
                          </td>

                          {/* Gönderen Hesap */}
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-slate-400">{txn.senderAccount}</span>
                          </td>

                          {/* Alıcı Hesap */}
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-slate-400">{txn.receiverAccount}</span>
                          </td>

                          {/* Tutar & Para Birimi */}
                          <td className="px-4 py-3 text-right whitespace-nowrap pr-8">
                            <span className="font-semibold text-white">
                              {formatCurrency(txn.amount)}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">{txn.currency}</span>
                          </td>

                          {/* İşlem Tipi */}
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {txn.transactionType}
                          </td>

                          {/* Risk Skoru (Progress Bar) */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${riskStyle.text} w-6`}>
                                {txn.riskScore}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full rounded-full ${riskStyle.bar}`}
                                  style={{ width: `${txn.riskScore}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Durum */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusStyle(txn.status)}`}>
                              {txn.status}
                            </span>
                          </td>

                          {/* Örüntü */}
                          <td className="px-4 py-3 text-xs text-slate-300">
                            {txn.pattern}
                          </td>

                          {/* Detay */}
                          <td className="px-4 py-3 text-center">
                            <Link
                              to={`/transactions/${txn.id}`}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Detayları Gör"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-slate-500 text-sm">
                        Arama kriterlerine uygun işlem bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Transactions

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShieldAlert,
  TrendingUp,
  Users,
  Banknote,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  dashboardStats,
  suspiciousTrend,
  riskDistribution,
} from '../data/mockData'
import { getTransactions } from '../services/transactionService'

// ─────────────────────────────────────────────
// Yardımcı Fonksiyonlar
// ─────────────────────────────────────────────

/** Tutarı Türk Lirası formatında gösterir */
function formatCurrency(value) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Büyük sayıları kısaltır (1.2M, 89K gibi) */
function formatCompact(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toString()
}

/** Risk skoruna göre renk döndürür */
function getRiskColor(score) {
  if (score >= 80) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' }
  if (score >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' }
  return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' }
}

/** Durum etiketine göre stil döndürür */
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

// ─────────────────────────────────────────────
// Alt Bileşenler
// ─────────────────────────────────────────────

/** Tek bir KPI özet kartı */
function StatCard({ title, value, icon: Icon, trend, trendValue, color, subtitle }) {
  const isPositive = trend === 'up'
  return (
    <div className="bg-[#0d1526] border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/60 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trendValue && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
              isPositive
                ? 'bg-red-500/10 text-red-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{title}</p>
      {subtitle && (
        <p className="text-[10px] text-slate-600 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

/** Recharts AreaChart özel tooltip */
function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#141d30] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl shadow-black/20">
      <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-xs text-slate-300">
            Şüpheli: <span className="text-white font-semibold">{payload[0]?.value}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-xs text-slate-300">
            Toplam: <span className="text-white font-semibold">{payload[1]?.value}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

/** Recharts PieChart özel legend */
function CustomLegend({ payload }) {
  return (
    <div className="flex flex-col gap-3 pl-4">
      {payload?.map((entry, index) => {
        const item = riskDistribution[index]
        return (
          <div key={entry.value} className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <div>
              <p className="text-sm text-white font-medium">{entry.value}</p>
              <p className="text-[11px] text-slate-500">
                {item?.count} işlem · %{item?.percentage}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// Ana Dashboard Bileşeni
// ─────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTransactions().then(data => {
      setTransactions(data || [])
      setLoading(false)
    })
  }, [])

  // En yüksek riskli 5 işlemi hesapla
  const topRiskTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)
  }, [transactions])

  return (
    <div className="space-y-6">

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* ── Başlık ── */}
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Genel Bakış</h1>
          <p className="text-xs text-slate-500 mt-1">
            Son 24 saat içindeki AML izleme özeti
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 px-3 py-1.5 rounded-lg">
          <Activity className="w-3.5 h-3.5" />
          <span className="font-medium">Canlı İzleme Aktif</span>
        </div>
      </div>

      {/* ── Özet Kartları ── */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="Toplam İşlem"
          value={dashboardStats.totalTransactions.toLocaleString('tr-TR')}
          icon={Activity}
          trend="up"
          trendValue="+12%"
          color="bg-blue-500/10 text-blue-400"
          subtitle="Son 30 gün"
        />
        <StatCard
          title="Şüpheli İşlem"
          value={dashboardStats.suspiciousTransactions}
          icon={ShieldAlert}
          trend="up"
          trendValue="+8%"
          color="bg-red-500/10 text-red-400"
          subtitle="İnceleme bekliyor"
        />
        <StatCard
          title="Ort. Risk Skoru"
          value={dashboardStats.averageRiskScore}
          icon={TrendingUp}
          trend="down"
          trendValue="-3%"
          color="bg-amber-500/10 text-amber-400"
          subtitle="0–100 arası"
        />
        <StatCard
          title="Yüksek Riskli Hesap"
          value={dashboardStats.highRiskAccounts}
          icon={Users}
          trend="up"
          trendValue="+1"
          color="bg-purple-500/10 text-purple-400"
          subtitle="Risk skoru >= 80"
        />
        <StatCard
          title="İşlem Hacmi"
          value={formatCurrency(dashboardStats.totalVolume)}
          icon={Banknote}
          color="bg-cyan-500/10 text-cyan-400"
          subtitle="Son 30 gün toplam"
        />
      </div>

      {/* ── Grafikler ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Şüpheli İşlem Trendi — 2 sütun genişliğinde */}
        <div className="col-span-2 bg-[#0d1526] border border-slate-800/50 rounded-2xl p-5" style={{ width: '100%', height: 350 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Şüpheli İşlem Trendi</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Son 14 günlük izleme</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-slate-500">Şüpheli</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-slate-500">Toplam</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={suspiciousTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientSuspicious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 11 }}
                dx={-5}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#334155', strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradientSuspicious)"
                dot={false}
                activeDot={{ r: 4, fill: '#ef4444', stroke: '#0d1526', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradientTotal)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', stroke: '#0d1526', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Dağılımı — 1 sütun genişliğinde */}
        <div className="bg-[#0d1526] border border-slate-800/50 rounded-2xl p-5" style={{ width: '100%', height: 340 }}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Risk Dağılımı</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Toplam {dashboardStats.totalTransactions.toLocaleString('tr-TR')} işlem</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="40%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="level"
                stroke="none"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                content={<CustomLegend />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── En Yüksek Riskli İşlemler ── */}
      <div className="bg-[#0d1526] border border-slate-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">En Yüksek Riskli İşlemler</h3>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Tümünü Gör
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Tablo Başlığı */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-800/50">
          <div className="col-span-2">İşlem ID</div>
          <div className="col-span-2 text-right">Tutar</div>
          <div className="col-span-2 text-center">Risk Skoru</div>
          <div className="col-span-3">Pattern</div>
          <div className="col-span-2 text-center">Durum</div>
          <div className="col-span-1" />
        </div>

        {/* Tablo Satırları */}
        {topRiskTransactions.map((txn) => {
          const risk = getRiskColor(txn.riskScore)
          return (
            <div
              key={txn.id}
              className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center border-b border-slate-800/30 last:border-b-0 hover:bg-white/[0.015] transition-colors cursor-pointer group"
              onClick={() => navigate(`/transactions/${txn.id}`)}
            >
              {/* İşlem ID */}
              <div className="col-span-2">
                <span className="text-sm text-white font-mono font-medium">{txn.id}</span>
              </div>

              {/* Tutar */}
              <div className="col-span-2 text-right">
                <span className="text-sm text-white font-semibold">
                  {txn.amount.toLocaleString('tr-TR')}
                </span>
                <span className="text-xs text-slate-500 ml-1">{txn.currency}</span>
              </div>

              {/* Risk Skoru */}
              <div className="col-span-2 flex justify-center">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${risk.bg} border ${risk.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                  <span className={`text-sm font-bold ${risk.text}`}>{txn.riskScore}</span>
                </div>
              </div>

              {/* Pattern */}
              <div className="col-span-3">
                <span className="text-sm text-slate-300">{txn.pattern}</span>
              </div>

              {/* Durum */}
              <div className="col-span-2 flex justify-center">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${getStatusStyle(txn.status)}`}>
                  {txn.status}
                </span>
              </div>

              {/* Detay oku */}
              <div className="col-span-1 flex justify-end">
                <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          )
        })}
      </div>
        </>
      )}
    </div>
  )
}

export default Dashboard

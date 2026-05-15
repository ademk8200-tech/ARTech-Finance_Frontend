import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  Activity,
  ShieldAlert,
  ArrowRight,
  User,
  Building,
  Info,
  Calendar,
  CreditCard,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getTransactionById } from '../services/transactionService'
import { getAccountById } from '../services/accountService'

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
  if (score >= 70) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500' }
  if (score >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'bg-amber-500' }
  return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500' }
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

// Generate dynamic risk reasons based on pattern
function generateRiskReasons(pattern) {
  const reasons = {
    'Smurfing': [
      'Kısa zaman aralığında küçük tutarlı ardışık transferler tespit edildi.',
      'Bildirim eşiğinin hemen altında kalacak şekilde tutarlar ayarlanmış.',
      'Aynı göndericiden birden fazla alıcıya sistematik dağıtım.',
    ],
    'Fan-in/Fan-out': [
      'Birden fazla hesaptan toplanan paralar tek bir hesaba yönlendirilmiş.',
      'Toplanan tutar kısa süre içerisinde başka bir ana hesaba aktarılmış.',
      'İşlemlerin ticari bir mantığı veya faturası bulunmuyor.',
    ],
    'Yüksek Tutar Transferi': [
      'Müşteri profilinin olağan işlem hacminin çok üzerinde transfer.',
      'Tek seferde yüksek miktarda meblağ çıkışı.',
      'Geçmiş işlemlere kıyasla risk skoru belirgin şekilde yüksek.',
    ],
    'Sık Tekrarlanan İşlem': [
      'Aynı alıcı/gönderici çifti arasında normal dışı sıklıkta işlem.',
      'Düşük tutarlı ancak toplamda büyük meblağa ulaşan transferler.',
    ],
    'Normal İşlem': [
      'Geçmiş işlemlere ve profil verilerine uygun transfer.',
      'Belirgin bir anomali tespit edilmedi.',
    ]
  }
  
  return reasons[pattern] || [
    'Hesap geçmişi ve işlem örüntüsü genel bir anomali içeriyor.',
    'Sistem algoritması standart dışı davranış tespit etti.',
    'Bağlantılı hesapların risk durumu ortalamanın üzerinde.'
  ]
}

function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [txn, setTxn] = useState(null)
  const [senderAcc, setSenderAcc] = useState(null)
  const [receiverAcc, setReceiverAcc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const transaction = await getTransactionById(id)
      if (transaction) {
        setTxn(transaction)
        
        // Mock IBAN to ACC ID logic
        const getAccId = (iban) => iban ? "ACC-" + iban.slice(-3) : null;
        
        const sAccId = getAccId(transaction.senderAccount)
        const rAccId = getAccId(transaction.receiverAccount)
        
        const [sAcc, rAcc] = await Promise.all([
          sAccId ? getAccountById(sAccId) : Promise.resolve(null),
          rAccId ? getAccountById(rAccId) : Promise.resolve(null)
        ])
        
        setSenderAcc(sAcc || {
          ownerName: 'Bilinmeyen Hesap',
          accountType: 'Bireysel',
          riskLevel: 'Bilinmiyor',
          riskScore: 50
        })
        
        setReceiverAcc(rAcc || {
          ownerName: 'Bilinmeyen Hesap',
          accountType: 'Kurumsal',
          riskLevel: 'Bilinmiyor',
          riskScore: 50
        })
      }
      setLoading(false)
    }
    
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!txn) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-bold text-white">İşlem Bulunamadı</h2>
        <p className="text-slate-400">Aradığınız {id} numaralı işlem sistemde mevcut değil.</p>
        <button
          onClick={() => navigate('/transactions')}
          className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          İşlemlere Dön
        </button>
      </div>
    )
  }

  const riskStyle = getRiskColor(txn.riskScore)
  const riskLevel = getRiskLevel(txn.riskScore)
  const riskReasons = generateRiskReasons(txn.pattern)

  return (
    <div className="space-y-6">
      
      {/* ── Üst Bilgi ve Geri Butonu ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/transactions')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">İşlem Detayı</h1>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getStatusStyle(txn.status)}`}>
                {txn.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-mono mt-1">{txn.id}</p>
          </div>
        </div>
        
        {/* Aksiyon Butonları */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium border border-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Normal İşaretle
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium border border-blue-500/20">
            <Activity className="w-4 h-4" />
            İncelemeye Al
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-medium shadow-lg shadow-blue-500/20">
            <FileText className="w-4 h-4" />
            Rapor Oluştur
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Sol Kolon: İşlem Özeti & Bağlantılı Hesaplar ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* İşlem Özeti Kartı */}
          <div className="bg-[#0d1526] border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              İşlem Özeti
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Tutar</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-white">{formatCurrency(txn.amount)}</p>
                  <span className="text-sm text-slate-400">{txn.currency}</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1">İşlem Tarihi</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-medium text-white">{formatDate(txn.date)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1">İşlem Tipi</p>
                <p className="text-sm font-medium text-white">{txn.transactionType}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Tespit Edilen Örüntü</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  {txn.pattern}
                </span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800/50">
              <div className="flex items-center justify-between relative">
                
                {/* Gönderen */}
                <div className="w-2/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      {senderAcc.accountType === 'Bireysel' ? (
                        <User className="w-5 h-5 text-slate-400" />
                      ) : (
                        <Building className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Gönderen</p>
                      <p className="text-sm font-bold text-white">{senderAcc.ownerName}</p>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded inline-block">
                    {txn.senderAccount}
                  </p>
                </div>
                
                {/* Ok */}
                <div className="flex-1 flex justify-center">
                  <div className="w-full flex items-center">
                    <div className="h-px bg-slate-700 w-full" />
                    <ArrowRight className="w-5 h-5 text-slate-500 shrink-0 mx-2" />
                    <div className="h-px bg-slate-700 w-full" />
                  </div>
                </div>

                {/* Alıcı */}
                <div className="w-2/5 flex flex-col items-end text-right">
                  <div className="flex items-center gap-3 mb-3 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      {receiverAcc.accountType === 'Bireysel' ? (
                        <User className="w-5 h-5 text-slate-400" />
                      ) : (
                        <Building className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Alıcı</p>
                      <p className="text-sm font-bold text-white">{receiverAcc.ownerName}</p>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded inline-block">
                    {txn.receiverAccount}
                  </p>
                </div>
                
              </div>
            </div>
          </div>

          {/* Bağlantılı Hesapların Risk Durumu */}
          <div className="bg-[#0d1526] border border-slate-800/50 rounded-2xl p-6">
             <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Hesap Risk Profilleri
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500 mb-2">Gönderen Hesap Riski</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${getRiskColor(senderAcc.riskScore).text}`}>
                    {senderAcc.riskLevel} Risk
                  </span>
                  <span className="text-lg font-bold text-white">{senderAcc.riskScore}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getRiskColor(senderAcc.riskScore).bar}`}
                    style={{ width: `${senderAcc.riskScore}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500 mb-2">Alıcı Hesap Riski</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${getRiskColor(receiverAcc.riskScore).text}`}>
                    {receiverAcc.riskLevel} Risk
                  </span>
                  <span className="text-lg font-bold text-white">{receiverAcc.riskScore}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getRiskColor(receiverAcc.riskScore).bar}`}
                    style={{ width: `${receiverAcc.riskScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Sağ Kolon: Risk Analizi ── */}
        <div className="space-y-6">
          
          {/* AI Risk Skoru */}
          <div className={`bg-[#0d1526] border ${riskStyle.border} rounded-2xl p-6 relative overflow-hidden`}>
            {/* Arka plan glow efekti */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${riskStyle.bg} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 opacity-50`} />
            
            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider relative z-10">
              Yapay Zeka Risk Skoru
            </h3>
            <p className="text-xs text-slate-400 mb-6 relative z-10">
              Derin öğrenme modeli ile hesaplanan anomali skoru
            </p>
            
            <div className="flex flex-col items-center justify-center py-4 relative z-10">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${riskStyle.border} ${riskStyle.bg} mb-4`}>
                <span className={`text-5xl font-black ${riskStyle.text}`}>
                  {txn.riskScore}
                </span>
              </div>
              <span className={`text-lg font-bold tracking-wider ${riskStyle.text} uppercase`}>
                {riskLevel} RİSK
              </span>
            </div>
          </div>

          {/* Bu işlem neden riskli? */}
          <div className="bg-[#0d1526] border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Bu işlem neden riskli?
            </h3>
            
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-5">
              <p className="text-sm text-slate-300 leading-relaxed flex gap-3">
                <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                {txn.explanation}
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tespit Edilen Faktörler</p>
              <ul className="space-y-2">
                {riskReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                    <span className="text-sm text-slate-300">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Model Açıklaması (XAI) */}
          {txn.xaiReasons && txn.xaiReasons.length > 0 && (
            <div className="bg-[#0d1526] border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Model Açıklaması (XAI)
              </h3>

              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Gerekçeleri</p>
                  <ul className="space-y-2">
                    {txn.xaiReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                        <span className="text-sm text-slate-300">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {txn.featureImportance && txn.featureImportance.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-800/50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Özellik Etki Dağılımı</p>
                    <div className="h-48" style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={txn.featureImportance}
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="feature" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12 }} 
                          />
                          <Tooltip 
                            cursor={{ fill: '#1e293b' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                            itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
                            {txn.featureImportance.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill="#a855f7" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}

export default TransactionDetail

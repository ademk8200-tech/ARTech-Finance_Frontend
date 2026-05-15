import { useState, useEffect, useMemo } from 'react';
import { FileBarChart, AlertTriangle, FileText, Download, X, ShieldAlert } from 'lucide-react';
import { getTransactions } from '../services/transactionService';

function Reports() {
  const [selectedTx, setSelectedTx] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then(data => {
      setTransactions(data || []);
      setLoading(false);
    });
  }, []);

  // 1. Veri Kaynağı ve Kısıtlamalar: Sadece Şüpheli ve İncelemede olanlar
  const filteredTransactions = transactions.filter(
    (t) => t.status === "Şüpheli" || t.status === "İncelemede"
  );

  const handleExportPDF = () => {
    alert("PDF dışa aktarma işlemi başlatıldı (MASAK Formatı).");
  };

  const getStatusColor = (status) => {
    if (status === "Şüpheli") return "bg-red-500/20 text-red-400";
    if (status === "İncelemede") return "bg-orange-500/20 text-orange-400";
    return "bg-slate-800 text-slate-400";
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return "text-red-400 font-bold";
    if (score >= 50) return "text-orange-400 font-semibold";
    return "text-green-400";
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && (
        <>
          <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileBarChart className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Raporlar (SAR & STR)</h1>
            <p className="text-sm text-slate-400">Şüpheli İşlem Bildirimi (STR) adayları ve inceleme bekleyen işlemler</p>
          </div>
        </div>
      </div>

      {/* 2. Arayüz Tasarımı (Ana Tablo) */}
      <div className="bg-black border border-white/10 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-slate-300">İşlem ID</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Tarih</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Tutar</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Risk Skoru</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Durum</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Tespit Edilen Örüntü</th>
                <th className="p-4 text-sm font-semibold text-slate-300 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-200">{tx.id}</td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(tx.date).toLocaleDateString('tr-TR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-200">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={getRiskScoreColor(tx.riskScore)}>
                      {tx.riskScore} / 100
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      {tx.pattern}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      İncele
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    İncelenmesi gereken şüpheli işlem bulunmamaktadır.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Detay ve Raporlama Paneli (Modal) */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-white">Şüpheli İşlem Bildirim (STR) Dosyası</h2>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* İşlem Özeti */}
              <div className="grid grid-cols-2 gap-6 p-2">
                <div>
                  <p className="text-sm text-gray-400 mb-1">İşlem ID</p>
                  <p className="text-lg text-white font-semibold">{selectedTx.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tarih</p>
                  <p className="text-lg text-white font-semibold">
                    {new Date(selectedTx.date).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Gönderici Hesap</p>
                  <p className="text-lg text-white font-semibold">{selectedTx.senderAccount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Alıcı Hesap</p>
                  <p className="text-lg text-white font-semibold">{selectedTx.receiverAccount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tutar</p>
                  <p className="text-lg text-white font-semibold">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedTx.currency }).format(selectedTx.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tespit Edilen Örüntü</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg text-white font-semibold">{selectedTx.pattern}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTx.status)}`}>
                      {selectedTx.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Yapay Zeka Gerekçesi */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-white" />
                  <h3 className="text-md font-semibold text-white">Yapay Zeka Tespit Gerekçesi</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedTx.explanation}
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-black/80 flex flex-col sm:flex-row justify-end items-center gap-4">
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-white transition-colors font-medium text-sm order-2 sm:order-1"
              >
                Kapat
              </button>
              <button 
                onClick={handleExportPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-colors order-1 sm:order-2"
              >
                <Download className="w-4 h-4" />
                PDF Olarak Dışa Aktar (MASAK Formatı)
              </button>
            </div>
          </div>
        </div>
      )}

        </>
      )}
    </div>
  );
}

export default Reports;

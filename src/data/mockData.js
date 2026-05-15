/**
 * Mock Data - Yapay Zeka Tabanlı Dinamik Kara Para Takip Sistemi
 *
 * Sprint 1: Gerçekçi AML (Anti-Money Laundering) demo verileri.
 * Tüm isimler, IBAN'lar ve veriler tamamen sahte/kurgusaldır.
 *
 * Veri yapıları:
 * 1. transactions    → İşlem listesi (risk skoru, pattern, durum)
 * 2. accounts        → Hesap bilgileri (risk seviyesi, işlem hacmi)
 * 3. dashboardStats  → Genel özet istatistikler
 * 4. suspiciousTrend → Günlere göre şüpheli işlem trendi
 * 5. riskDistribution→ Risk dağılım grafiği verisi
 * 6. networkData     → Ağ analizi node/edge verisi
 */

// ─────────────────────────────────────────────
// 1. İşlemler (Transactions)
// ─────────────────────────────────────────────
export const transactions = [
  {
    id: "TXN-001",
    senderAccount: "TR10 0001 2345 6789 0000 0001",
    receiverAccount: "TR20 0002 3456 7890 0000 0002",
    amount: 9800,
    currency: "TRY",
    date: "2026-05-12T10:23:00",
    transactionType: "Havale",
    riskScore: 82,
    status: "Şüpheli",
    pattern: "Smurfing",
    explanation:
      "10.000 TL eşiğinin hemen altında ardışık transfer tespit edildi. Son 3 gün içinde aynı gönderici 4 kez benzer tutarda işlem yapmış.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-002",
    senderAccount: "TR30 0003 4567 8901 0000 0003",
    receiverAccount: "TR40 0004 5678 9012 0000 0004",
    amount: 245000,
    currency: "TRY",
    date: "2026-05-12T09:15:00",
    transactionType: "EFT",
    riskScore: 91,
    status: "Şüpheli",
    pattern: "Yüksek Tutar Transferi",
    explanation:
      "Hesap profiline göre olağandışı yüksek tutar. Hesap sahibinin aylık ortalama işlem hacmi 15.000 TL iken tek seferde 245.000 TL gönderilmiş.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-003",
    senderAccount: "TR50 0005 6789 0123 0000 0005",
    receiverAccount: "TR10 0001 2345 6789 0000 0001",
    amount: 4500,
    currency: "TRY",
    date: "2026-05-11T16:42:00",
    transactionType: "Havale",
    riskScore: 35,
    status: "Normal",
    pattern: "Normal İşlem",
    explanation: "Düzenli maaş ödemesi ile uyumlu transfer. Risk skoru eşik altında.",
    xaiReasons: [],
    importantNodes: [],
    importantEdges: [],
    featureImportance: []
  },
  {
    id: "TXN-004",
    senderAccount: "TR60 0006 7890 1234 0000 0006",
    receiverAccount: "TR70 0007 8901 2345 0000 0007",
    amount: 9950,
    currency: "TRY",
    date: "2026-05-11T14:30:00",
    transactionType: "Havale",
    riskScore: 78,
    status: "İncelemede",
    pattern: "Smurfing",
    explanation:
      "10.000 TL raporlama eşiğinin hemen altında yapılan transfer. Aynı gönderici son 48 saatte 3 benzer işlem gerçekleştirmiş.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-005",
    senderAccount: "TR80 0008 9012 3456 0000 0008",
    receiverAccount: "TR90 0009 0123 4567 0000 0009",
    amount: 1250,
    currency: "USD",
    date: "2026-05-11T11:20:00",
    transactionType: "SWIFT",
    riskScore: 65,
    status: "İncelemede",
    pattern: "Sık Tekrarlanan İşlem",
    explanation:
      "Son 7 gün içinde aynı alıcıya 12 adet küçük tutarlı döviz transferi yapılmış. Yapılandırma şüphesi mevcut.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-006",
    senderAccount: "TR20 0002 3456 7890 0000 0002",
    receiverAccount: "TR30 0003 4567 8901 0000 0003",
    amount: 18750,
    currency: "TRY",
    date: "2026-05-10T08:55:00",
    transactionType: "EFT",
    riskScore: 25,
    status: "Normal",
    pattern: "Normal İşlem",
    explanation: "Ticari hesaplar arası olağan ödeme. Geçmiş işlem profili ile uyumlu.",
    xaiReasons: [],
    importantNodes: [],
    importantEdges: [],
    featureImportance: []
  },
  {
    id: "TXN-007",
    senderAccount: "TR40 0004 5678 9012 0000 0004",
    receiverAccount: "TR50 0005 6789 0123 0000 0005",
    amount: 75000,
    currency: "TRY",
    date: "2026-05-10T15:10:00",
    transactionType: "EFT",
    riskScore: 88,
    status: "Şüpheli",
    pattern: "Fan-in/Fan-out",
    explanation:
      "Hesaba 5 farklı kaynaktan toplam 75.000 TL gelmiş ve aynı gün tek bir hesaba aktarılmış. Klasik fan-in/fan-out yapısı.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-008",
    senderAccount: "TR70 0007 8901 2345 0000 0007",
    receiverAccount: "TR80 0008 9012 3456 0000 0008",
    amount: 320000,
    currency: "TRY",
    date: "2026-05-09T13:45:00",
    transactionType: "EFT",
    riskScore: 95,
    status: "Şüpheli",
    pattern: "Yüksek Tutar Transferi",
    explanation:
      "Yeni açılan hesaptan yüksek tutarlı transfer. Hesap açılış tarihi: 2 hafta önce. Müşteri profili ile orantısız hacim.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-009",
    senderAccount: "TR90 0009 0123 4567 0000 0009",
    receiverAccount: "TR60 0006 7890 1234 0000 0006",
    amount: 5200,
    currency: "EUR",
    date: "2026-05-09T10:30:00",
    transactionType: "SWIFT",
    riskScore: 72,
    status: "İncelemede",
    pattern: "Sık Tekrarlanan İşlem",
    explanation:
      "Yurtdışı hesaba düzenli döviz çıkışı. Son 30 günde 8 benzer işlem tespit edildi. Toplam çıkış tutarı 41.600 EUR.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-010",
    senderAccount: "TR10 0001 2345 6789 0000 0001",
    receiverAccount: "TR40 0004 5678 9012 0000 0004",
    amount: 9900,
    currency: "TRY",
    date: "2026-05-08T17:20:00",
    transactionType: "Havale",
    riskScore: 80,
    status: "Şüpheli",
    pattern: "Smurfing",
    explanation:
      "Raporlama eşiği altında tekrarlayan transfer. Gönderici hesap son 5 günde 6 farklı alıcıya benzer tutarlarda havale yapmış.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-011",
    senderAccount: "TR30 0003 4567 8901 0000 0003",
    receiverAccount: "TR90 0009 0123 4567 0000 0009",
    amount: 12400,
    currency: "TRY",
    date: "2026-05-08T09:00:00",
    transactionType: "EFT",
    riskScore: 20,
    status: "Normal",
    pattern: "Normal İşlem",
    explanation: "Düzenli kira ödemesi. Aylık tekrarlayan işlem profili ile uyumlu.",
    xaiReasons: [],
    importantNodes: [],
    importantEdges: [],
    featureImportance: []
  },
  {
    id: "TXN-012",
    senderAccount: "TR50 0005 6789 0123 0000 0005",
    receiverAccount: "TR70 0007 8901 2345 0000 0007",
    amount: 185000,
    currency: "TRY",
    date: "2026-05-07T14:15:00",
    transactionType: "EFT",
    riskScore: 86,
    status: "Şüpheli",
    pattern: "Fan-in/Fan-out",
    explanation:
      "Birden fazla hesaptan toplanan fonlar tek bir hesaba yönlendirilmiş. Transfer zincirinde 3 ara hesap kullanılmış.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-013",
    senderAccount: "TR60 0006 7890 1234 0000 0006",
    receiverAccount: "TR20 0002 3456 7890 0000 0002",
    amount: 7800,
    currency: "TRY",
    date: "2026-05-07T11:50:00",
    transactionType: "Havale",
    riskScore: 15,
    status: "Normal",
    pattern: "Normal İşlem",
    explanation: "Tedarikçi ödemesi. İşlem geçmişiyle uyumlu rutin transfer.",
    xaiReasons: [],
    importantNodes: [],
    importantEdges: [],
    featureImportance: []
  },
  {
    id: "TXN-014",
    senderAccount: "TR80 0008 9012 3456 0000 0008",
    receiverAccount: "TR10 0001 2345 6789 0000 0001",
    amount: 9750,
    currency: "TRY",
    date: "2026-05-06T16:30:00",
    transactionType: "Havale",
    riskScore: 76,
    status: "İncelemede",
    pattern: "Smurfing",
    explanation:
      "Eşik altı transfer dizisi. Gönderici ve alıcı arasında son 10 günde 7 işlem tespit edildi.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-015",
    senderAccount: "TR40 0004 5678 9012 0000 0004",
    receiverAccount: "TR60 0006 7890 1234 0000 0006",
    amount: 450000,
    currency: "TRY",
    date: "2026-05-06T10:05:00",
    transactionType: "EFT",
    riskScore: 93,
    status: "Şüpheli",
    pattern: "Yüksek Tutar Transferi",
    explanation:
      "Bireysel hesaptan kurumsal hesaba olağandışı yüksek tutar. Hesap sahibinin beyan ettiği gelir düzeyi ile orantısız.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-016",
    senderAccount: "TR70 0007 8901 2345 0000 0007",
    receiverAccount: "TR30 0003 4567 8901 0000 0003",
    amount: 3200,
    currency: "TRY",
    date: "2026-05-05T13:25:00",
    transactionType: "Havale",
    riskScore: 10,
    status: "Normal",
    pattern: "Normal İşlem",
    explanation: "Market alışverişi ödemesi. Küçük tutarlı rutin işlem.",
    xaiReasons: [],
    importantNodes: [],
    importantEdges: [],
    featureImportance: []
  },
  {
    id: "TXN-017",
    senderAccount: "TR90 0009 0123 4567 0000 0009",
    receiverAccount: "TR50 0005 6789 0123 0000 0005",
    amount: 28000,
    currency: "TRY",
    date: "2026-05-05T09:40:00",
    transactionType: "EFT",
    riskScore: 55,
    status: "İncelemede",
    pattern: "Sık Tekrarlanan İşlem",
    explanation:
      "Son 2 hafta içinde aynı alıcıya 5 transfer. Toplam tutar 140.000 TL. Parçalama şüphesi değerlendiriliyor.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-018",
    senderAccount: "TR20 0002 3456 7890 0000 0002",
    receiverAccount: "TR80 0008 9012 3456 0000 0008",
    amount: 67500,
    currency: "TRY",
    date: "2026-05-04T15:55:00",
    transactionType: "EFT",
    riskScore: 84,
    status: "Şüpheli",
    pattern: "Fan-in/Fan-out",
    explanation:
      "3 farklı hesaptan gelen fonlar birleştirilerek tek hesaba yönlendirilmiş. Ara hesap olarak kullanıldığı değerlendirilmektedir.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-019",
    senderAccount: "TR10 0001 2345 6789 0000 0001",
    receiverAccount: "TR70 0007 8901 2345 0000 0007",
    amount: 9850,
    currency: "TRY",
    date: "2026-05-04T12:10:00",
    transactionType: "Havale",
    riskScore: 79,
    status: "Şüpheli",
    pattern: "Smurfing",
    explanation:
      "10.000 TL altında sistematik transfer. Bu gönderici-alıcı çifti arasında son 1 ayda 11 işlem kaydı mevcut.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
  {
    id: "TXN-020",
    senderAccount: "TR50 0005 6789 0123 0000 0005",
    receiverAccount: "TR90 0009 0123 4567 0000 0009",
    amount: 2100,
    currency: "USD",
    date: "2026-05-03T08:30:00",
    transactionType: "SWIFT",
    riskScore: 68,
    status: "İncelemede",
    pattern: "Sık Tekrarlanan İşlem",
    explanation:
      "Yurtdışına sık aralıklarla küçük tutarlı döviz transferi. Son 3 haftada toplam 14.700 USD çıkış yapılmış.",
    xaiReasons: [
      "İşlem tutarı geçmiş ortalamanın üzerinde",
      "Kaynak hesap kısa sürede çoklu hesaba aktarım yapmış",
      "Alıcı hesap son 30 günde 8 farklı şüpheli işlemde geçmiş"
    ],
    importantNodes: ["ACC-001", "ACC-004"],
    importantEdges: [["ACC-001", "ACC-004"], ["ACC-004", "ACC-007"]],
    featureImportance: [
      { feature: "İşlem Tutarı", impact: 0.34 },
      { feature: "Hesap Yaşı", impact: 0.28 },
      { feature: "Bağlantı Sayısı", impact: 0.22 },
      { feature: "Zaman Örüntüsü", impact: 0.16 }
    ]
  },
]

// ─────────────────────────────────────────────
// 2. Hesaplar (Accounts)
// ─────────────────────────────────────────────
export const accounts = [
  {
    id: "ACC-001",
    ownerName: "Ahmet Yılmaz",
    accountType: "Bireysel",
    totalIncoming: 385000,
    totalOutgoing: 372000,
    transactionCount: 47,
    riskLevel: "Yüksek",
    riskScore: 85,
  },
  {
    id: "ACC-002",
    ownerName: "Deniz Ticaret Ltd. Şti.",
    accountType: "Kurumsal",
    totalIncoming: 1250000,
    totalOutgoing: 1180000,
    transactionCount: 124,
    riskLevel: "Orta",
    riskScore: 52,
  },
  {
    id: "ACC-003",
    ownerName: "Elif Kara",
    accountType: "Bireysel",
    totalIncoming: 95000,
    totalOutgoing: 88000,
    transactionCount: 18,
    riskLevel: "Düşük",
    riskScore: 22,
  },
  {
    id: "ACC-004",
    ownerName: "Mehmet Demir",
    accountType: "Bireysel",
    totalIncoming: 520000,
    totalOutgoing: 515000,
    transactionCount: 63,
    riskLevel: "Yüksek",
    riskScore: 91,
  },
  {
    id: "ACC-005",
    ownerName: "Yıldız İnşaat A.Ş.",
    accountType: "Kurumsal",
    totalIncoming: 2100000,
    totalOutgoing: 2050000,
    transactionCount: 89,
    riskLevel: "Orta",
    riskScore: 48,
  },
  {
    id: "ACC-006",
    ownerName: "Fatma Çelik",
    accountType: "Bireysel",
    totalIncoming: 680000,
    totalOutgoing: 670000,
    transactionCount: 72,
    riskLevel: "Yüksek",
    riskScore: 78,
  },
  {
    id: "ACC-007",
    ownerName: "Kuzey Lojistik Ltd. Şti.",
    accountType: "Kurumsal",
    totalIncoming: 890000,
    totalOutgoing: 875000,
    transactionCount: 56,
    riskLevel: "Yüksek",
    riskScore: 88,
  },
  {
    id: "ACC-008",
    ownerName: "Burak Özkan",
    accountType: "Bireysel",
    totalIncoming: 1450000,
    totalOutgoing: 1420000,
    transactionCount: 95,
    riskLevel: "Yüksek",
    riskScore: 94,
  },
  {
    id: "ACC-009",
    ownerName: "Atlas Dış Ticaret A.Ş.",
    accountType: "Kurumsal",
    totalIncoming: 3200000,
    totalOutgoing: 3100000,
    transactionCount: 142,
    riskLevel: "Orta",
    riskScore: 62,
  },
  {
    id: "ACC-010",
    ownerName: "Zeynep Arslan",
    accountType: "Bireysel",
    totalIncoming: 42000,
    totalOutgoing: 38000,
    transactionCount: 12,
    riskLevel: "Düşük",
    riskScore: 8,
  },
]

// ─────────────────────────────────────────────
// 3. Dashboard İstatistikleri
// ─────────────────────────────────────────────
export const dashboardStats = {
  totalTransactions: 1247,
  suspiciousTransactions: 89,
  averageRiskScore: 47.3,
  highRiskAccounts: 4,
  totalVolume: 12580000,
}

// ─────────────────────────────────────────────
// 4. Şüpheli İşlem Trendi (Son 14 Gün)
// ─────────────────────────────────────────────
export const suspiciousTrend = [
  { date: "29 Nis", count: 3, total: 82 },
  { date: "30 Nis", count: 5, total: 91 },
  { date: "01 May", count: 4, total: 88 },
  { date: "02 May", count: 7, total: 95 },
  { date: "03 May", count: 6, total: 90 },
  { date: "04 May", count: 8, total: 102 },
  { date: "05 May", count: 5, total: 87 },
  { date: "06 May", count: 9, total: 110 },
  { date: "07 May", count: 7, total: 94 },
  { date: "08 May", count: 6, total: 89 },
  { date: "09 May", count: 10, total: 105 },
  { date: "10 May", count: 8, total: 98 },
  { date: "11 May", count: 11, total: 112 },
  { date: "12 May", count: 9, total: 104 },
]

// ─────────────────────────────────────────────
// 5. Risk Dağılımı
// ─────────────────────────────────────────────
export const riskDistribution = [
  { level: "Düşük", count: 743, percentage: 59.6, color: "#22c55e" },
  { level: "Orta", count: 315, percentage: 25.3, color: "#f59e0b" },
  { level: "Yüksek", count: 189, percentage: 15.1, color: "#ef4444" },
]

// ─────────────────────────────────────────────
// 6. Ağ Analizi Verisi (Network Data)
// ─────────────────────────────────────────────
export const networkData = {
  nodes: [
    { id: "ACC-001", label: "Ahmet Yılmaz", type: "Bireysel", riskScore: 85 },
    { id: "ACC-002", label: "Deniz Ticaret Ltd.", type: "Kurumsal", riskScore: 52 },
    { id: "ACC-003", label: "Elif Kara", type: "Bireysel", riskScore: 22 },
    { id: "ACC-004", label: "Mehmet Demir", type: "Bireysel", riskScore: 91 },
    { id: "ACC-005", label: "Yıldız İnşaat A.Ş.", type: "Kurumsal", riskScore: 48 },
    { id: "ACC-006", label: "Fatma Çelik", type: "Bireysel", riskScore: 78 },
    { id: "ACC-007", label: "Kuzey Lojistik Ltd.", type: "Kurumsal", riskScore: 88 },
    { id: "ACC-008", label: "Burak Özkan", type: "Bireysel", riskScore: 94 },
    { id: "ACC-009", label: "Atlas Dış Ticaret A.Ş.", type: "Kurumsal", riskScore: 62 },
    { id: "ACC-010", label: "Zeynep Arslan", type: "Bireysel", riskScore: 8 },
  ],
  edges: [
    // Smurfing zinciri: ACC-001 → birden fazla hesaba eşik altı transferler
    { source: "ACC-001", target: "ACC-002", amount: 9800, label: "Smurfing", riskScore: 82 },
    { source: "ACC-001", target: "ACC-004", amount: 9900, label: "Smurfing", riskScore: 80 },
    { source: "ACC-001", target: "ACC-007", amount: 9850, label: "Smurfing", riskScore: 79 },

    // Fan-in: Birden fazla hesap → ACC-004 → tek çıkış
    { source: "ACC-003", target: "ACC-004", amount: 15000, label: "Fan-in", riskScore: 65 },
    { source: "ACC-006", target: "ACC-004", amount: 22000, label: "Fan-in", riskScore: 70 },
    { source: "ACC-004", target: "ACC-005", amount: 75000, label: "Fan-out", riskScore: 88 },

    // Yüksek tutar transferleri
    { source: "ACC-003", target: "ACC-004", amount: 245000, label: "Yüksek Tutar", riskScore: 91 },
    { source: "ACC-008", target: "ACC-001", amount: 320000, label: "Yüksek Tutar", riskScore: 95 },
    { source: "ACC-004", target: "ACC-006", amount: 450000, label: "Yüksek Tutar", riskScore: 93 },

    // Normal ticari akış
    { source: "ACC-002", target: "ACC-003", amount: 18750, label: "Normal", riskScore: 25 },
    { source: "ACC-005", target: "ACC-007", amount: 12400, label: "Normal", riskScore: 20 },
    { source: "ACC-006", target: "ACC-002", amount: 7800, label: "Normal", riskScore: 15 },
    { source: "ACC-007", target: "ACC-003", amount: 3200, label: "Normal", riskScore: 10 },

    // Uluslararası transferler
    { source: "ACC-008", target: "ACC-009", amount: 1250, label: "SWIFT", riskScore: 65 },
    { source: "ACC-009", target: "ACC-006", amount: 5200, label: "SWIFT", riskScore: 72 },
    { source: "ACC-005", target: "ACC-009", amount: 2100, label: "SWIFT", riskScore: 68 },

    // Fan-in/Fan-out karmaşık yapı
    { source: "ACC-002", target: "ACC-008", amount: 67500, label: "Fan-in/Fan-out", riskScore: 84 },
    { source: "ACC-005", target: "ACC-007", amount: 185000, label: "Fan-in/Fan-out", riskScore: 86 },
    { source: "ACC-009", target: "ACC-005", amount: 28000, label: "Tekrarlayan", riskScore: 55 },

    // Ek bağlantılar — ağ yoğunluğu
    { source: "ACC-010", target: "ACC-003", amount: 4500, label: "Normal", riskScore: 12 },
    { source: "ACC-010", target: "ACC-002", amount: 8200, label: "Normal", riskScore: 18 },
  ],
}

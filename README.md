# ARTech Finance - AML Takip Sistemi

**ARTech Finance**, yapay zeka destekli dinamik bir Kara Para Aklama (AML - Anti-Money Laundering) takip sistemi frontend arayüzüdür. Bu proje, **TEKNOFEST 2026 Finansal Teknolojiler** yarışması için geliştirilmiş, şüpheli finansal işlemleri analiz etmeyi ve görselleştirmeyi amaçlayan modern bir web uygulamasıdır.

## 🚀 Proje Hakkında

Sistem, hesap hareketlerindeki anormallikleri, smurfing (parçalama), fan-in/fan-out gibi kara para aklama örüntülerini tespit ederek güvenlik operasyon merkezlerine (SOC) kullanıcı dostu, şık ve detaylı bir analiz arayüzü sunar.

## 🛠 Kullanılan Teknolojiler

- **React.js** (Frontend Kütüphanesi)
- **Vite** (Hızlı Derleme ve Geliştirme Ortamı)
- **Tailwind CSS** (Modern ve Responsive UI Tasarımı)
- **Recharts** (Veri Analitiği Grafikleri)
- **React Force Graph 2D** (Ağ ve İlişki Görselleştirme)
- **Lucide React** (İkon Seti)
- **React Router DOM** (Sayfa Yönlendirmeleri)

## 📦 Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1. Proje dizinine gidin:
   ```bash
   cd ARTech-Finance_Frontend
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

Uygulama varsayılan olarak `http://localhost:5173/` adresinde çalışacaktır.

## 📑 Sayfa Açıklamaları

Sistem, kullanıcılarına zengin bir veri takibi sunmak için aşağıdaki modüllerden oluşur:

- **Dashboard (Genel Bakış):** Sistemin özet durumunu gösterir. Toplam işlem hacmi, yüksek riskli işlemler, şüpheli işlem trend grafikleri ve risk dağılım pastası bu sayfada yer alır.
- **İşlemler:** Tüm işlem kayıtlarının listelendiği, risk seviyelerine göre filtrelenebilir (Yüksek, Orta, Düşük) gelişmiş bir veri tablosudur.
- **İşlem Detay:** Tablodan seçilen spesifik bir işlemin çok daha derin analizini sunar. Gönderici/Alıcı hesap profilleri, işlem yolculuğu ve yapay zeka karar mekanizması raporu bulunur.
- **Ağ Analizi:** Hesaplar arası para transferlerini, ilişkileri ve hub hesapları *Force-Directed Graph* mantığıyla görselleştirir. Düğümlere (hesaplara) tıklayarak detaylarına sağ panelden erişebilirsiniz.
- **Raporlar (SAR & STR):** Yalnızca "Şüpheli" ve "İncelemede" olan işlemleri listeler. Masak bildirim formatına (STR) uygun olarak PDF dışa aktarma (mock) simülasyonunu ve AI gerekçelerini gösterir.

## ⚠️ Önemli Not (Mock Data)

Şu anda proje **tamamen statik mock (sahte) verilerle** (`src/data/mockData.js`) çalışmaktadır. Gösterilen tüm IBAN'lar, isimler, tutarlar ve analizler kurgusaldır.

> **Gelecek Planı:** Projenin bir sonraki fazında gerçek zamanlı veri akışı ve gelişmiş yapay zeka algoritmaları için bir **Backend API bağlantısı** (FastAPI / Python tabanlı) sisteme entegre edilecektir.

---
*Geliştirilmiş ve Tasarlanmış: ARTech Team | Teknofest 2026*

# 🏙️ Şehir Roleplay Discord Botu

Türkçe tam özellikli şehir roleplay botu. Panel tabanlı etkileşimler, SQLite veritabanı, yedekleme ve istatistik sistemi içerir.

## 🚀 Kurulum

### Railway (Önerilen)
1. Bu repoyu Railway'e bağlayın
2. Environment Variables bölümüne şunları ekleyin:
   - `DISCORD_TOKEN` — Bot tokeniniz
   - `DISCORD_CLIENT_ID` — Uygulama Client ID'niz
3. Deploy edin, otomatik başlar!

### Yerel Kurulum
```bash
npm install
cp .env.example .env
# .env dosyasını düzenleyin
node src/deploy-commands.js   # Slash komutlarını yükle
node src/index.js             # Botu başlat
```

## 📋 Panel Komutları

| Komut | Açıklama |
|-------|----------|
| `/panel-kur` | Seçilen kanalda panel kurar |
| `/panel-kaldir` | Paneli kaldırır |
| `/panel-yenile` | Paneli yeniler |
| `/panel-duzenle` | Panel başlık/açıklamasını düzenler |
| `/panel-tasi` | Paneli başka kanala taşır |
| `/panel-bilgi` | Tüm panelleri listeler |

## 🎛️ Panel Türleri

### 🏛️ Vatandaş Paneli
- Kimlik Oluştur
- Kimlik Görüntüle
- Başvurularım
- Vatandaş Bilgileri

### 🏢 Belediye Paneli
- Ruhsat Başvurusu
- İşletme Başvurusu
- Ruhsat Sorgulama

### 🚔 Polis Paneli
- Polis İhbarı
- Sabıka Sorgulama
- Aranan Sorgulama

### ⚖️ Mahkeme Paneli
- Dava Açma Talebi
- İtiraz Talebi
- Dava Durumu

### 🎫 Bilet Paneli
- Şikayet
- Destek
- Yetkili Başvurusu
- Ruhsat Başvurusu
- Polis İhbarı

## ⚙️ Admin Komutları

| Komut | Açıklama |
|-------|----------|
| `/ayarlar goster` | Mevcut ayarları gösterir |
| `/ayarlar vatandas-rol` | Vatandaş rolünü ayarlar |
| `/ayarlar polis-rol` | Polis rolünü ayarlar |
| `/ayarlar belediye-rol` | Belediye rolünü ayarlar |
| `/ayarlar mahkeme-rol` | Mahkeme rolünü ayarlar |
| `/istatistik` | Sunucu istatistiklerini gösterir |
| `/yedek-al` | Tüm verileri JSON olarak yedekler |
| `/yedek-yukle` | Yedekten verileri geri yükler |

## 👮 Polis Komutları

| Komut | Açıklama |
|-------|----------|
| `/sabika-ekle` | Sabıka kaydı ekler |
| `/aranan-ekle` | Arananlar listesine ekler |
| `/aranan-kaldir` | Arananlar listesinden çıkarır |

## ⚖️ Mahkeme Komutları

| Komut | Açıklama |
|-------|----------|
| `/dava-karar` | Davaya karar girer |

## 🏢 Belediye Komutları

| Komut | Açıklama |
|-------|----------|
| `/ruhsat-ver` | Vatandaşa ruhsat verir |
| `/vatandas-sil` | Vatandaş kaydını siler (Admin) |

## 🗄️ Veritabanı

SQLite kullanır. Tablolar:
- `citizens` — Vatandaşlar
- `licenses` — Ruhsatlar
- `criminal_records` — Sabıka Kayıtları
- `wanted_records` — Aranan Kayıtları
- `court_cases` — Mahkeme Davaları
- `businesses` — İşletmeler
- `applications` — Başvurular
- `tickets` — Biletler
- `panels` — Panel Yapılandırmaları
- `server_settings` — Sunucu Ayarları

## 🔄 Bot Yeniden Başlatıldığında

- Tüm paneller otomatik geri yüklenir
- Tüm buton etkileşimleri aktif kalır
- Tüm veritabanı verileri korunur

## 📦 Railway Ortam Değişkenleri

```
DISCORD_TOKEN=your_token
DISCORD_CLIENT_ID=your_client_id
```

> `DB_PATH` isteğe bağlıdır. Varsayılan: `data/sehir.db`

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/sehir.db');

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS citizens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT UNIQUE NOT NULL,
      guild_id TEXT NOT NULL,
      ad TEXT NOT NULL,
      soyad TEXT NOT NULL,
      dogum_tarihi TEXT NOT NULL,
      cinsiyet TEXT NOT NULL,
      kimlik_no TEXT UNIQUE NOT NULL,
      telefon TEXT,
      adres TEXT,
      meslek TEXT DEFAULT 'İşsiz',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_id INTEGER NOT NULL,
      discord_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      lisans_turu TEXT NOT NULL,
      lisans_no TEXT UNIQUE NOT NULL,
      verilis_tarihi TEXT DEFAULT (datetime('now')),
      gecerlilik TEXT,
      durum TEXT DEFAULT 'Aktif',
      FOREIGN KEY (citizen_id) REFERENCES citizens(id)
    );

    CREATE TABLE IF NOT EXISTS criminal_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_id INTEGER NOT NULL,
      discord_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      suc_turu TEXT NOT NULL,
      aciklama TEXT,
      ceza TEXT,
      yetkili TEXT,
      tarih TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (citizen_id) REFERENCES citizens(id)
    );

    CREATE TABLE IF NOT EXISTS wanted_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_id INTEGER NOT NULL,
      discord_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      sebep TEXT NOT NULL,
      yetkili TEXT NOT NULL,
      durum TEXT DEFAULT 'Aktif',
      tarih TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (citizen_id) REFERENCES citizens(id)
    );

    CREATE TABLE IF NOT EXISTS court_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      davaci_id TEXT NOT NULL,
      davali_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      dava_no TEXT UNIQUE NOT NULL,
      konu TEXT NOT NULL,
      aciklama TEXT,
      durum TEXT DEFAULT 'Beklemede',
      hakim TEXT,
      karar TEXT,
      tarih TEXT DEFAULT (datetime('now')),
      guncelleme TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      isletme_adi TEXT NOT NULL,
      isletme_turu TEXT NOT NULL,
      adres TEXT,
      ruhsat_no TEXT UNIQUE NOT NULL,
      durum TEXT DEFAULT 'Beklemede',
      tarih TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      basvuru_turu TEXT NOT NULL,
      icerik TEXT NOT NULL,
      durum TEXT DEFAULT 'Beklemede',
      yetkili TEXT,
      notlar TEXT,
      tarih TEXT DEFAULT (datetime('now')),
      guncelleme TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      konu TEXT NOT NULL,
      tur TEXT NOT NULL,
      aciklama TEXT NOT NULL,
      durum TEXT DEFAULT 'Açık',
      yetkili TEXT,
      channel_id TEXT,
      tarih TEXT DEFAULT (datetime('now')),
      kapanis TEXT
    );

    CREATE TABLE IF NOT EXISTS panels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      message_id TEXT,
      panel_turu TEXT NOT NULL,
      baslik TEXT,
      aciklama TEXT,
      renk TEXT DEFAULT '#5865F2',
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(guild_id, channel_id, panel_turu)
    );

    CREATE TABLE IF NOT EXISTS server_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT UNIQUE NOT NULL,
      vatandas_rol TEXT,
      polis_rol TEXT,
      belediye_rol TEXT,
      mahkeme_rol TEXT,
      yetkili_rol TEXT,
      log_channel TEXT,
      ticket_category TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_citizens_discord ON citizens(discord_id, guild_id);
    CREATE INDEX IF NOT EXISTS idx_panels_guild ON panels(guild_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);
  `);
  console.log('[DB] Veritabanı başarıyla başlatıldı.');
}

module.exports = { db, initDatabase };

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yedek-yukle')
    .setDescription('Yedek dosyasından verileri geri yükler.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption(o => o.setName('dosya').setDescription('JSON yedek dosyası').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const attachment = interaction.options.getAttachment('dosya');

    if (!attachment.name.endsWith('.json')) {
      return interaction.editReply('❌ Lütfen geçerli bir JSON yedek dosyası yükleyin.');
    }

    try {
      const response = await fetch(attachment.url);
      const backup = await response.json();

      if (!backup.meta || !backup.meta.guild_id) {
        return interaction.editReply('❌ Geçersiz yedek dosyası formatı.');
      }

      const g = interaction.guildId;
      let yuklenen = 0;

      const insertOrIgnore = (table, fields, values) => {
        const cols = fields.join(', ');
        const placeholders = fields.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (${cols}) VALUES (${placeholders})`);
        for (const row of values) {
          try { stmt.run(fields.map(f => row[f])); yuklenen++; } catch {}
        }
      };

      if (backup.citizens?.length)         insertOrIgnore('citizens',        ['discord_id','guild_id','ad','soyad','dogum_tarihi','cinsiyet','kimlik_no','meslek'], backup.citizens);
      if (backup.licenses?.length)         insertOrIgnore('licenses',        ['citizen_id','discord_id','guild_id','lisans_turu','lisans_no','durum'], backup.licenses);
      if (backup.criminal_records?.length) insertOrIgnore('criminal_records',['citizen_id','discord_id','guild_id','suc_turu','aciklama','ceza','yetkili'], backup.criminal_records);
      if (backup.wanted_records?.length)   insertOrIgnore('wanted_records',  ['citizen_id','discord_id','guild_id','sebep','yetkili','durum'], backup.wanted_records);
      if (backup.court_cases?.length)      insertOrIgnore('court_cases',     ['davaci_id','davali_id','guild_id','dava_no','konu','aciklama','durum'], backup.court_cases);
      if (backup.businesses?.length)       insertOrIgnore('businesses',      ['owner_id','guild_id','isletme_adi','isletme_turu','adres','ruhsat_no','durum'], backup.businesses);
      if (backup.applications?.length)     insertOrIgnore('applications',    ['discord_id','guild_id','basvuru_turu','icerik','durum'], backup.applications);
      if (backup.tickets?.length)          insertOrIgnore('tickets',         ['discord_id','guild_id','konu','tur','aciklama','durum'], backup.tickets);

      return interaction.editReply(`✅ Yedek başarıyla yüklendi! **${yuklenen}** kayıt geri yüklendi.\n⚠️ Panelleri yenilemek için \`/panel-yenile\` komutunu kullanın.`);
    } catch (err) {
      console.error('[YEDEK-YUKLE]', err);
      return interaction.editReply(`❌ Yedek yüklenirken hata: ${err.message}`);
    }
  }
};

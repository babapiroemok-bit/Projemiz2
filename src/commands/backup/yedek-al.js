const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { db } = require('../../database/db');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yedek-al')
    .setDescription('Tüm bot verilerini JSON formatında yedekler.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const g = interaction.guildId;

    try {
      const backup = {
        meta: {
          guild_id: g,
          tarih: new Date().toISOString(),
          versiyon: '1.0.0'
        },
        citizens:        db.prepare('SELECT * FROM citizens WHERE guild_id = ?').all(g),
        licenses:        db.prepare('SELECT * FROM licenses WHERE guild_id = ?').all(g),
        criminal_records:db.prepare('SELECT * FROM criminal_records WHERE guild_id = ?').all(g),
        wanted_records:  db.prepare('SELECT * FROM wanted_records WHERE guild_id = ?').all(g),
        court_cases:     db.prepare('SELECT * FROM court_cases WHERE guild_id = ?').all(g),
        businesses:      db.prepare('SELECT * FROM businesses WHERE guild_id = ?').all(g),
        applications:    db.prepare('SELECT * FROM applications WHERE guild_id = ?').all(g),
        tickets:         db.prepare('SELECT * FROM tickets WHERE guild_id = ?').all(g),
        panels:          db.prepare('SELECT * FROM panels WHERE guild_id = ?').all(g),
        server_settings: db.prepare('SELECT * FROM server_settings WHERE guild_id = ?').all(g),
      };

      const json = JSON.stringify(backup, null, 2);
      const tmpPath = path.join(__dirname, `../../..`, `backup_${g}_${Date.now()}.json`);
      fs.writeFileSync(tmpPath, json, 'utf8');

      const attachment = new AttachmentBuilder(tmpPath, { name: `yedek_${new Date().toISOString().slice(0,10)}.json` });
      await interaction.editReply({ content: `✅ Yedek başarıyla oluşturuldu!\n📦 ${Object.keys(backup).filter(k=>k!=='meta').map(k=>`**${k}**: ${backup[k].length}`).join(' | ')}`, files: [attachment] });

      fs.unlinkSync(tmpPath);
    } catch (err) {
      console.error('[YEDEK-AL]', err);
      return interaction.editReply(`❌ Yedek alınırken hata: ${err.message}`);
    }
  }
};

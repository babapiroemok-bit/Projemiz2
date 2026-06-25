const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('istatistik')
    .setDescription('Sunucu istatistiklerini gösterir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const g = interaction.guildId;

    const citizens   = db.prepare('SELECT COUNT(*) as c FROM citizens WHERE guild_id = ?').get(g).c;
    const licenses   = db.prepare('SELECT COUNT(*) as c FROM licenses WHERE guild_id = ?').get(g).c;
    const crimes     = db.prepare('SELECT COUNT(*) as c FROM criminal_records WHERE guild_id = ?').get(g).c;
    const cases      = db.prepare('SELECT COUNT(*) as c FROM court_cases WHERE guild_id = ?').get(g).c;
    const businesses = db.prepare('SELECT COUNT(*) as c FROM businesses WHERE guild_id = ?').get(g).c;
    const tickets    = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE guild_id = ?').get(g).c;
    const wanted     = db.prepare("SELECT COUNT(*) as c FROM wanted_records WHERE guild_id = ? AND durum='Aktif'").get(g).c;
    const apps       = db.prepare("SELECT COUNT(*) as c FROM applications WHERE guild_id = ? AND durum='Beklemede'").get(g).c;

    const embed = new EmbedBuilder()
      .setTitle('📊 Sunucu İstatistikleri')
      .setColor(0x5865F2)
      .addFields(
        { name: '👥 Kayıtlı Vatandaş', value: citizens.toString(), inline: true },
        { name: '📜 Toplam Ruhsat',    value: licenses.toString(), inline: true },
        { name: '⚠️ Sabıka Kaydı',    value: crimes.toString(), inline: true },
        { name: '⚖️ Mahkeme Davası',  value: cases.toString(), inline: true },
        { name: '🏪 İşletme',          value: businesses.toString(), inline: true },
        { name: '🎫 Toplam Bilet',     value: tickets.toString(), inline: true },
        { name: '🔎 Aranan (Aktif)',   value: wanted.toString(), inline: true },
        { name: '📋 Bekleyen Başvuru', value: apps.toString(), inline: true },
      )
      .setFooter({ text: 'Şehir Botu • İstatistik Sistemi' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
};

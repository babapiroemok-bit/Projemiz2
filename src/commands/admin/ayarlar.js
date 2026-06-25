const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ayarlar')
    .setDescription('Sunucu bot ayarlarını yapılandırır.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName('goster').setDescription('Mevcut ayarları gösterir.'))
    .addSubcommand(s => s.setName('vatandas-rol').setDescription('Vatandaş rolünü ayarlar.')
      .addRoleOption(o => o.setName('rol').setDescription('Vatandaş rolü').setRequired(true)))
    .addSubcommand(s => s.setName('polis-rol').setDescription('Polis rolünü ayarlar.')
      .addRoleOption(o => o.setName('rol').setDescription('Polis rolü').setRequired(true)))
    .addSubcommand(s => s.setName('belediye-rol').setDescription('Belediye rolünü ayarlar.')
      .addRoleOption(o => o.setName('rol').setDescription('Belediye rolü').setRequired(true)))
    .addSubcommand(s => s.setName('mahkeme-rol').setDescription('Mahkeme rolünü ayarlar.')
      .addRoleOption(o => o.setName('rol').setDescription('Mahkeme rolü').setRequired(true)))
    .addSubcommand(s => s.setName('yetkili-rol').setDescription('Yetkili rolünü ayarlar.')
      .addRoleOption(o => o.setName('rol').setDescription('Yetkili rolü').setRequired(true)))
    .addSubcommand(s => s.setName('log-kanal').setDescription('Log kanalını ayarlar.')
      .addChannelOption(o => o.setName('kanal').setDescription('Log kanalı').setRequired(true))),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();
    const g = interaction.guildId;

    const ensure = () => {
      const exists = db.prepare('SELECT id FROM server_settings WHERE guild_id = ?').get(g);
      if (!exists) db.prepare('INSERT OR IGNORE INTO server_settings (guild_id) VALUES (?)').run(g);
    };

    if (sub === 'goster') {
      const s = db.prepare('SELECT * FROM server_settings WHERE guild_id = ?').get(g);
      if (!s) return interaction.editReply('❌ Henüz ayar yapılmamış. `/ayarlar` alt komutlarını kullanın.');
      const embed = new EmbedBuilder()
        .setTitle('⚙️ Sunucu Ayarları')
        .setColor(0x5865F2)
        .addFields(
          { name: '👥 Vatandaş Rol', value: s.vatandas_rol ? `<@&${s.vatandas_rol}>` : 'Ayarlanmamış', inline: true },
          { name: '🚔 Polis Rol',    value: s.polis_rol    ? `<@&${s.polis_rol}>` : 'Ayarlanmamış', inline: true },
          { name: '🏢 Belediye Rol', value: s.belediye_rol ? `<@&${s.belediye_rol}>` : 'Ayarlanmamış', inline: true },
          { name: '⚖️ Mahkeme Rol', value: s.mahkeme_rol  ? `<@&${s.mahkeme_rol}>` : 'Ayarlanmamış', inline: true },
          { name: '🔑 Yetkili Rol',  value: s.yetkili_rol  ? `<@&${s.yetkili_rol}>` : 'Ayarlanmamış', inline: true },
          { name: '📝 Log Kanal',    value: s.log_channel  ? `<#${s.log_channel}>` : 'Ayarlanmamış', inline: true },
        ).setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    ensure();
    const fieldMap = {
      'vatandas-rol': ['vatandas_rol', interaction.options.getRole('rol')?.id],
      'polis-rol':    ['polis_rol',    interaction.options.getRole('rol')?.id],
      'belediye-rol': ['belediye_rol', interaction.options.getRole('rol')?.id],
      'mahkeme-rol':  ['mahkeme_rol',  interaction.options.getRole('rol')?.id],
      'yetkili-rol':  ['yetkili_rol',  interaction.options.getRole('rol')?.id],
      'log-kanal':    ['log_channel',  interaction.options.getChannel('kanal')?.id],
    };

    const [field, value] = fieldMap[sub] || [];
    if (!field || !value) return interaction.editReply('❌ Geçersiz değer.');
    db.prepare(`UPDATE server_settings SET ${field} = ?, updated_at = datetime('now') WHERE guild_id = ?`).run(value, g);
    return interaction.editReply(`✅ **${sub}** başarıyla güncellendi!`);
  }
};

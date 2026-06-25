const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');
const { formatDate } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel-bilgi')
    .setDescription("Sunucudaki tüm panelleri listeler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const panels = db.prepare('SELECT * FROM panels WHERE guild_id = ?').all(interaction.guildId);
    if (!panels.length) return interaction.editReply('📭 Bu sunucuda kurulu panel bulunmamaktadır.');

    const embed = new EmbedBuilder()
      .setTitle('📋 Sunucu Panelleri')
      .setColor(0x5865F2)
      .setDescription(panels.map(p =>
        `**${p.panel_turu}** — <#${p.channel_id}>\n🔢 Mesaj: ${p.message_id ? `\`${p.message_id}\`` : 'Bilinmiyor'}\n📅 Oluşturma: ${formatDate(p.created_at)}`
      ).join('\n\n'))
      .setFooter({ text: `Toplam ${panels.length} panel` })
      .setTimestamp();
    return interaction.editReply({ embeds: [embed] });
  }
};

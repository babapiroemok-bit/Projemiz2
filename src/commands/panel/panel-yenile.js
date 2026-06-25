const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { db } = require('../../database/db');
const { buildPanelEmbed, buildPanelComponents } = require('../../panels/panelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel-yenile')
    .setDescription('Paneli yeniler (mesajı günceller).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('tur').setDescription('Panel türü').setRequired(true)
      .addChoices(
        { name: '🏛️ Vatandaş Paneli', value: 'vatandas' },
        { name: '🏢 Belediye Paneli', value: 'belediye' },
        { name: '🚔 Polis Paneli', value: 'polis' },
        { name: '⚖️ Mahkeme Paneli', value: 'mahkeme' },
        { name: '🎫 Bilet Paneli', value: 'bilet' },
      ))
    .addChannelOption(o => o.setName('kanal').setDescription('Kanalı seçin').setRequired(false)
      .addChannelTypes(ChannelType.GuildText)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const tur = interaction.options.getString('tur');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;
    const guildId = interaction.guildId;

    const panel = db.prepare('SELECT * FROM panels WHERE guild_id = ? AND channel_id = ? AND panel_turu = ?').get(guildId, channel.id, tur);
    if (!panel) return interaction.editReply(`❌ ${channel} kanalında **${tur}** paneli bulunamadı.`);

    try {
      const embed = buildPanelEmbed(panel);
      const components = buildPanelComponents(panel.panel_turu);

      if (panel.message_id) {
        const msg = await channel.messages.fetch(panel.message_id).catch(() => null);
        if (msg) {
          await msg.edit({ embeds: [embed], components });
          return interaction.editReply(`✅ Panel başarıyla yenilendi.`);
        }
      }
      const sent = await channel.send({ embeds: [embed], components });
      db.prepare('UPDATE panels SET message_id = ? WHERE id = ?').run(sent.id, panel.id);
      return interaction.editReply(`✅ Panel yeniden oluşturuldu.`);
    } catch (err) {
      return interaction.editReply(`❌ Hata: ${err.message}`);
    }
  }
};

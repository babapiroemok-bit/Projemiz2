const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { db } = require('../../database/db');
const { buildPanelEmbed, buildPanelComponents } = require('../../panels/panelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel-duzenle')
    .setDescription("Panel başlığını veya açıklamasını düzenler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('tur').setDescription('Panel türü').setRequired(true)
      .addChoices(
        { name: '🏛️ Vatandaş Paneli', value: 'vatandas' },
        { name: '🏢 Belediye Paneli', value: 'belediye' },
        { name: '🚔 Polis Paneli', value: 'polis' },
        { name: '⚖️ Mahkeme Paneli', value: 'mahkeme' },
        { name: '🎫 Bilet Paneli', value: 'bilet' },
      ))
    .addStringOption(o => o.setName('baslik').setDescription('Yeni başlık').setRequired(false))
    .addStringOption(o => o.setName('aciklama').setDescription('Yeni açıklama').setRequired(false))
    .addChannelOption(o => o.setName('kanal').setDescription('Kanalı seçin').setRequired(false)
      .addChannelTypes(ChannelType.GuildText)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const tur = interaction.options.getString('tur');
    const baslik = interaction.options.getString('baslik');
    const aciklama = interaction.options.getString('aciklama');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;
    const guildId = interaction.guildId;

    if (!baslik && !aciklama) return interaction.editReply('❌ En az bir alan (başlık veya açıklama) girmelisiniz.');

    const panel = db.prepare('SELECT * FROM panels WHERE guild_id = ? AND channel_id = ? AND panel_turu = ?').get(guildId, channel.id, tur);
    if (!panel) return interaction.editReply(`❌ ${channel} kanalında **${tur}** paneli bulunamadı.`);

    if (baslik) db.prepare('UPDATE panels SET baslik = ? WHERE id = ?').run(baslik, panel.id);
    if (aciklama) db.prepare('UPDATE panels SET aciklama = ? WHERE id = ?').run(aciklama, panel.id);

    const updatedPanel = db.prepare('SELECT * FROM panels WHERE id = ?').get(panel.id);
    const embed = buildPanelEmbed(updatedPanel);
    const components = buildPanelComponents(tur);

    if (panel.message_id) {
      const msg = await channel.messages.fetch(panel.message_id).catch(() => null);
      if (msg) await msg.edit({ embeds: [embed], components });
    }
    return interaction.editReply(`✅ Panel başarıyla güncellendi.`);
  }
};

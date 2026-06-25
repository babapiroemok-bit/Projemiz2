const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { db } = require('../../database/db');
const { buildPanelEmbed, buildPanelComponents } = require('../../panels/panelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel-tasi')
    .setDescription("Paneli başka bir kanala taşır.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('tur').setDescription('Panel türü').setRequired(true)
      .addChoices(
        { name: '🏛️ Vatandaş Paneli', value: 'vatandas' },
        { name: '🏢 Belediye Paneli', value: 'belediye' },
        { name: '🚔 Polis Paneli', value: 'polis' },
        { name: '⚖️ Mahkeme Paneli', value: 'mahkeme' },
        { name: '🎫 Bilet Paneli', value: 'bilet' },
      ))
    .addChannelOption(o => o.setName('mevcut_kanal').setDescription('Mevcut kanal').setRequired(true)
      .addChannelTypes(ChannelType.GuildText))
    .addChannelOption(o => o.setName('yeni_kanal').setDescription('Taşınacak kanal').setRequired(true)
      .addChannelTypes(ChannelType.GuildText)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const tur = interaction.options.getString('tur');
    const mevcutKanal = interaction.options.getChannel('mevcut_kanal');
    const yeniKanal = interaction.options.getChannel('yeni_kanal');
    const guildId = interaction.guildId;

    const panel = db.prepare('SELECT * FROM panels WHERE guild_id = ? AND channel_id = ? AND panel_turu = ?').get(guildId, mevcutKanal.id, tur);
    if (!panel) return interaction.editReply(`❌ ${mevcutKanal} kanalında **${tur}** paneli bulunamadı.`);

    const exists = db.prepare('SELECT id FROM panels WHERE guild_id = ? AND channel_id = ? AND panel_turu = ?').get(guildId, yeniKanal.id, tur);
    if (exists) return interaction.editReply(`❌ ${yeniKanal} kanalında zaten bir **${tur}** paneli mevcut.`);

    try {
      if (panel.message_id) {
        const msg = await mevcutKanal.messages.fetch(panel.message_id).catch(() => null);
        if (msg) await msg.delete().catch(() => {});
      }
      const embed = buildPanelEmbed(panel);
      const components = buildPanelComponents(tur);
      const sent = await yeniKanal.send({ embeds: [embed], components });
      db.prepare('UPDATE panels SET channel_id = ?, message_id = ? WHERE id = ?').run(yeniKanal.id, sent.id, panel.id);
      return interaction.editReply(`✅ Panel ${yeniKanal} kanalına taşındı.`);
    } catch (err) {
      return interaction.editReply(`❌ Hata: ${err.message}`);
    }
  }
};

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { db } = require('../../database/db');
const { sendPanel } = require('../../panels/panelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel-kur')
    .setDescription('Belirtilen kanalda bir panel kurar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('tur').setDescription('Panel türü').setRequired(true)
      .addChoices(
        { name: '🏛️ Vatandaş Paneli', value: 'vatandas' },
        { name: '🏢 Belediye Paneli', value: 'belediye' },
        { name: '🚔 Polis Paneli', value: 'polis' },
        { name: '⚖️ Mahkeme Paneli', value: 'mahkeme' },
        { name: '🎫 Bilet Paneli', value: 'bilet' },
      ))
    .addChannelOption(o => o.setName('kanal').setDescription('Panelin kurulacağı kanal').setRequired(false)
      .addChannelTypes(ChannelType.GuildText)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const tur = interaction.options.getString('tur');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;
    const guildId = interaction.guildId;

    const existing = db.prepare('SELECT * FROM panels WHERE guild_id = ? AND channel_id = ? AND panel_turu = ?').get(guildId, channel.id, tur);
    if (existing) {
      return interaction.editReply(`❌ Bu kanalda zaten bir **${tur}** paneli mevcut. Kaldırmak için \`/panel-kaldir\` kullanın.`);
    }

    try {
      const message = await sendPanel(channel, tur);
      db.prepare(`INSERT INTO panels (guild_id, channel_id, message_id, panel_turu, created_by) VALUES (?, ?, ?, ?, ?)`)
        .run(guildId, channel.id, message.id, tur, interaction.user.id);
      return interaction.editReply(`✅ **${tur}** paneli ${channel} kanalında başarıyla kuruldu!`);
    } catch (err) {
      console.error('[PANEL-KUR]', err);
      return interaction.editReply(`❌ Panel kurulurken hata oluştu: ${err.message}`);
    }
  }
};

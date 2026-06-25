const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dava-karar')
    .setDescription('Dava kararı girer. (Mahkeme hakimi)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o => o.setName('dava_no').setDescription('Dava numarası').setRequired(true))
    .addStringOption(o => o.setName('karar').setDescription('Karar').setRequired(true)
      .addChoices(
        { name: 'Beraat', value: 'Beraat' },
        { name: 'Mahkumiyet', value: 'Mahkumiyet' },
        { name: 'Erteleme', value: 'Erteleme' },
        { name: 'Ret', value: 'Ret' },
      ))
    .addStringOption(o => o.setName('aciklama').setDescription('Karar açıklaması').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const dava_no  = interaction.options.getString('dava_no');
    const karar    = interaction.options.getString('karar');
    const aciklama = interaction.options.getString('aciklama') || '';
    const guildId  = interaction.guildId;

    const dava = db.prepare('SELECT * FROM court_cases WHERE dava_no = ? AND guild_id = ?').get(dava_no, guildId);
    if (!dava) return interaction.editReply(`❌ \`${dava_no}\` numaralı dava bulunamadı.`);

    db.prepare(`UPDATE court_cases SET durum = 'Karara Bağlandı', karar = ?, hakim = ?, guncelleme = datetime('now') WHERE dava_no = ? AND guild_id = ?`)
      .run(`${karar}: ${aciklama}`, interaction.user.tag, dava_no, guildId);

    return interaction.editReply(`✅ **${dava_no}** davası karara bağlandı.\n⚖️ Karar: **${karar}**\n${aciklama ? `📝 Açıklama: ${aciklama}` : ''}`);
  }
};

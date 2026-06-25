const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../database/db');
const { getCitizen, isPolice } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sabika-ekle')
    .setDescription('Vatandaşa sabıka kaydı ekler. (Polis yetkilisi)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(o => o.setName('vatandas').setDescription('Vatandaş').setRequired(true))
    .addStringOption(o => o.setName('suc').setDescription('Suç türü').setRequired(true))
    .addStringOption(o => o.setName('ceza').setDescription('Verilen ceza').setRequired(true))
    .addStringOption(o => o.setName('aciklama').setDescription('Açıklama').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const hedef = interaction.options.getUser('vatandas');
    const suc   = interaction.options.getString('suc');
    const ceza  = interaction.options.getString('ceza');
    const aciklama = interaction.options.getString('aciklama') || '';
    const guildId  = interaction.guildId;

    const citizen = getCitizen(hedef.id, guildId);
    if (!citizen) return interaction.editReply('❌ Bu kullanıcının kayıtlı kimliği bulunmuyor.');

    db.prepare(`INSERT INTO criminal_records (citizen_id, discord_id, guild_id, suc_turu, aciklama, ceza, yetkili)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(citizen.id, hedef.id, guildId, suc, aciklama, ceza, interaction.user.tag);

    return interaction.editReply(`✅ **${citizen.ad} ${citizen.soyad}** adına sabıka kaydı eklendi.\n⚖️ Suç: ${suc}\n🔒 Ceza: ${ceza}`);
  }
};

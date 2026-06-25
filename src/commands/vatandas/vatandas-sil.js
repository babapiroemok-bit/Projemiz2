const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../database/db');
const { getCitizen } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vatandas-sil')
    .setDescription('Vatandaş kaydını siler. (Yetkili)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('vatandas').setDescription('Vatandaş').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const hedef   = interaction.options.getUser('vatandas');
    const guildId = interaction.guildId;

    const citizen = getCitizen(hedef.id, guildId);
    if (!citizen) return interaction.editReply('❌ Vatandaş kaydı bulunamadı.');

    db.prepare('DELETE FROM criminal_records WHERE citizen_id = ?').run(citizen.id);
    db.prepare('DELETE FROM wanted_records WHERE citizen_id = ?').run(citizen.id);
    db.prepare('DELETE FROM licenses WHERE citizen_id = ?').run(citizen.id);
    db.prepare('DELETE FROM citizens WHERE id = ?').run(citizen.id);

    return interaction.editReply(`✅ **${citizen.ad} ${citizen.soyad}** adlı vatandaşın tüm kayıtları silindi.`);
  }
};

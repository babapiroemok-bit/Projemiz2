const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../database/db');
const { getCitizen } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aranan-kaldir')
    .setDescription('Vatandaşı arananlar listesinden çıkarır. (Polis yetkilisi)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(o => o.setName('vatandas').setDescription('Vatandaş').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const hedef   = interaction.options.getUser('vatandas');
    const guildId = interaction.guildId;

    const citizen = getCitizen(hedef.id, guildId);
    if (!citizen) return interaction.editReply('❌ Vatandaş bulunamadı.');

    const result = db.prepare("UPDATE wanted_records SET durum = 'Kapatıldı' WHERE citizen_id = ? AND durum = 'Aktif'").run(citizen.id);
    if (result.changes === 0) return interaction.editReply('❌ Bu vatandaşın aktif aranan kaydı yok.');

    return interaction.editReply(`✅ **${citizen.ad} ${citizen.soyad}** arananlar listesinden çıkarıldı.`);
  }
};

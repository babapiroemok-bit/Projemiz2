const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../database/db');
const { getCitizen } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aranan-ekle')
    .setDescription('Vatandaşı arananlar listesine ekler. (Polis yetkilisi)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(o => o.setName('vatandas').setDescription('Vatandaş').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Aranma sebebi').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const hedef  = interaction.options.getUser('vatandas');
    const sebep  = interaction.options.getString('sebep');
    const guildId = interaction.guildId;

    const citizen = getCitizen(hedef.id, guildId);
    if (!citizen) return interaction.editReply('❌ Bu kullanıcının kayıtlı kimliği bulunmuyor.');

    const existing = db.prepare("SELECT id FROM wanted_records WHERE citizen_id = ? AND durum = 'Aktif'").get(citizen.id);
    if (existing) return interaction.editReply('❌ Bu vatandaş zaten arananlar listesinde.');

    db.prepare(`INSERT INTO wanted_records (citizen_id, discord_id, guild_id, sebep, yetkili) VALUES (?, ?, ?, ?, ?)`)
      .run(citizen.id, hedef.id, guildId, sebep, interaction.user.tag);

    return interaction.editReply(`✅ **${citizen.ad} ${citizen.soyad}** arananlar listesine eklendi.\n📋 Sebep: ${sebep}`);
  }
};

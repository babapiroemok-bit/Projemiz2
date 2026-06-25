const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../database/db');
const { getCitizen, generateRuhsatNo } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ruhsat-ver')
    .setDescription('Vatandaşa ruhsat verir. (Belediye yetkilisi)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(o => o.setName('vatandas').setDescription('Vatandaş').setRequired(true))
    .addStringOption(o => o.setName('tur').setDescription('Ruhsat türü').setRequired(true)
      .addChoices(
        { name: 'Ehliyet', value: 'Ehliyet' },
        { name: 'Silah Ruhsatı', value: 'Silah Ruhsatı' },
        { name: 'İşletme Ruhsatı', value: 'İşletme Ruhsatı' },
        { name: 'Sürücü Belgesi', value: 'Sürücü Belgesi' },
        { name: 'Özel Güvenlik', value: 'Özel Güvenlik' },
      )),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const hedef  = interaction.options.getUser('vatandas');
    const tur    = interaction.options.getString('tur');
    const guildId = interaction.guildId;

    const citizen = getCitizen(hedef.id, guildId);
    if (!citizen) return interaction.editReply('❌ Bu kullanıcının kayıtlı kimliği bulunmuyor.');

    const lisans_no = generateRuhsatNo(tur);
    db.prepare(`INSERT INTO licenses (citizen_id, discord_id, guild_id, lisans_turu, lisans_no) VALUES (?, ?, ?, ?, ?)`)
      .run(citizen.id, hedef.id, guildId, tur, lisans_no);

    return interaction.editReply(`✅ **${citizen.ad} ${citizen.soyad}** adına **${tur}** verildi.\n🔢 Ruhsat No: \`${lisans_no}\``);
  }
};

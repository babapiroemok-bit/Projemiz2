const { EmbedBuilder } = require('discord.js');
const { db } = require('../database/db');
const { generateKimlikNo, generateRuhsatNo, generateDavaNo, getCitizen, formatDate } = require('../utils/helpers');

async function handleModal(interaction, client) {
  const { customId, user, guildId } = interaction;

  // Kimlik Oluştur
  if (customId === 'modal_kimlik_olustur') {
    const ad = interaction.fields.getTextInputValue('ad').trim();
    const soyad = interaction.fields.getTextInputValue('soyad').trim();
    const dogum_tarihi = interaction.fields.getTextInputValue('dogum_tarihi').trim();
    const cinsiyet = interaction.fields.getTextInputValue('cinsiyet').trim();
    const meslek = interaction.fields.getTextInputValue('meslek').trim() || 'İşsiz';
    const kimlik_no = generateKimlikNo();
    try {
      db.prepare(`INSERT INTO citizens (discord_id, guild_id, ad, soyad, dogum_tarihi, cinsiyet, kimlik_no, meslek)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(user.id, guildId, ad, soyad, dogum_tarihi, cinsiyet, kimlik_no, meslek);
      const embed = new EmbedBuilder()
        .setTitle('✅ Kimlik Başarıyla Oluşturuldu!')
        .setColor(0x2ecc71)
        .addFields(
          { name: '👤 Ad Soyad', value: `${ad} ${soyad}`, inline: true },
          { name: '🔢 Kimlik No', value: kimlik_no, inline: true },
          { name: '🎂 Doğum Tarihi', value: dogum_tarihi, inline: true },
          { name: '⚧ Cinsiyet', value: cinsiyet, inline: true },
          { name: '💼 Meslek', value: meslek, inline: true }
        )
        .setFooter({ text: 'Şehir Botu • Kimlik Sistemi' })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        return interaction.reply({ content: '❌ Bu Discord hesabı zaten kayıtlı!', ephemeral: true });
      }
      throw err;
    }
  }

  // Ruhsat Başvurusu
  if (customId.startsWith('modal_ruhsat_basvuru_')) {
    const citizen = getCitizen(user.id, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Önce kimlik oluşturmanız gerekiyor.', ephemeral: true });
    const lisans_turu = interaction.fields.getTextInputValue('lisans_turu').trim();
    const aciklama = interaction.fields.getTextInputValue('aciklama').trim();
    db.prepare(`INSERT INTO applications (discord_id, guild_id, basvuru_turu, icerik) VALUES (?, ?, ?, ?)`)
      .run(user.id, guildId, `Ruhsat - ${lisans_turu}`, aciklama || 'Açıklama girilmedi');
    return interaction.reply({ content: `✅ **${lisans_turu}** ruhsat başvurunuz alındı. Yetkililer en kısa sürede inceleyecektir.`, ephemeral: true });
  }

  // İşletme Başvurusu
  if (customId === 'modal_isletme_basvuru') {
    const citizen = getCitizen(user.id, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Önce kimlik oluşturmanız gerekiyor.', ephemeral: true });
    const isletme_adi = interaction.fields.getTextInputValue('isletme_adi').trim();
    const isletme_turu = interaction.fields.getTextInputValue('isletme_turu').trim();
    const adres = interaction.fields.getTextInputValue('adres').trim();
    const ruhsat_no = generateRuhsatNo(isletme_turu);
    db.prepare(`INSERT INTO businesses (owner_id, guild_id, isletme_adi, isletme_turu, adres, ruhsat_no) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(user.id, guildId, isletme_adi, isletme_turu, adres, ruhsat_no);
    return interaction.reply({ content: `✅ **${isletme_adi}** işletme başvurunuz alındı!\n🔢 Referans No: \`${ruhsat_no}\``, ephemeral: true });
  }

  // Polis İhbarı
  if (customId === 'modal_polis_ihbar') {
    const konu = interaction.fields.getTextInputValue('konu').trim();
    const konum = interaction.fields.getTextInputValue('konum').trim();
    const aciklama = interaction.fields.getTextInputValue('aciklama').trim();
    db.prepare(`INSERT INTO applications (discord_id, guild_id, basvuru_turu, icerik) VALUES (?, ?, ?, ?)`)
      .run(user.id, guildId, 'Polis İhbarı', `Konu: ${konu}\nKonum: ${konum}\nAçıklama: ${aciklama}`);
    return interaction.reply({ content: '🚨 İhbarınız alındı! En yakın polis ekipleri yönlendiriliyor.', ephemeral: true });
  }

  // Sabıka Sorgula
  if (customId === 'modal_sorgula_sabika') {
    const query = interaction.fields.getTextInputValue('discord_id').trim();
    const citizen = db.prepare('SELECT * FROM citizens WHERE (discord_id = ? OR kimlik_no = ?) AND guild_id = ?').get(query, query, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Vatandaş bulunamadı.', ephemeral: true });
    const records = db.prepare('SELECT * FROM criminal_records WHERE citizen_id = ? ORDER BY tarih DESC').all(citizen.id);
    if (!records.length) {
      return interaction.reply({ content: `✅ **${citizen.ad} ${citizen.soyad}** adlı vatandaşın sabıka kaydı bulunmamaktadır.`, ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle(`📋 Sabıka Kaydı — ${citizen.ad} ${citizen.soyad}`)
      .setColor(0xe74c3c)
      .setDescription(records.map(r => `**${r.suc_turu}**\n📝 ${r.aciklama}\n⚖️ Ceza: ${r.ceza}\n👮 Yetkili: ${r.yetkili}\n📅 ${formatDate(r.tarih)}`).join('\n\n'))
      .setTimestamp();
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Aranan Sorgula
  if (customId === 'modal_sorgula_aranan') {
    const query = interaction.fields.getTextInputValue('discord_id').trim();
    const citizen = db.prepare('SELECT * FROM citizens WHERE (discord_id = ? OR kimlik_no = ?) AND guild_id = ?').get(query, query, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Vatandaş bulunamadı.', ephemeral: true });
    const records = db.prepare("SELECT * FROM wanted_records WHERE citizen_id = ? AND durum = 'Aktif'").all(citizen.id);
    if (!records.length) {
      return interaction.reply({ content: `✅ **${citizen.ad} ${citizen.soyad}** arananlar listesinde değil.`, ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle(`🔎 Aranan Kaydı — ${citizen.ad} ${citizen.soyad}`)
      .setColor(0xe74c3c)
      .setDescription(records.map(r => `**Sebep:** ${r.sebep}\n👮 Yetkili: ${r.yetkili}\n📅 ${formatDate(r.tarih)}`).join('\n\n'))
      .setTimestamp();
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Ruhsat Sorgula
  if (customId === 'modal_sorgula_ruhsat') {
    const query = interaction.fields.getTextInputValue('discord_id').trim();
    const citizen = db.prepare('SELECT * FROM citizens WHERE (discord_id = ? OR kimlik_no = ?) AND guild_id = ?').get(query, query, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Vatandaş bulunamadı.', ephemeral: true });
    const licenses = db.prepare('SELECT * FROM licenses WHERE citizen_id = ?').all(citizen.id);
    if (!licenses.length) return interaction.reply({ content: `❌ **${citizen.ad} ${citizen.soyad}** adına kayıtlı ruhsat bulunmamaktadır.`, ephemeral: true });
    const embed = new EmbedBuilder()
      .setTitle(`📜 Ruhsatlar — ${citizen.ad} ${citizen.soyad}`)
      .setColor(0x2ecc71)
      .setDescription(licenses.map(l => `**${l.lisans_turu}**\n🔢 No: ${l.lisans_no}\n✅ Durum: ${l.durum}\n📅 ${formatDate(l.verilis_tarihi)}`).join('\n\n'))
      .setTimestamp();
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Dava Aç
  if (customId === 'modal_dava_ac') {
    const citizen = getCitizen(user.id, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Dava açmak için kimlik gerekiyor.', ephemeral: true });
    const davali_id = interaction.fields.getTextInputValue('davali_id').trim();
    const konu = interaction.fields.getTextInputValue('konu').trim();
    const aciklama = interaction.fields.getTextInputValue('aciklama').trim();
    const dava_no = generateDavaNo();
    db.prepare(`INSERT INTO court_cases (davaci_id, davali_id, guild_id, dava_no, konu, aciklama) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(user.id, davali_id, guildId, dava_no, konu, aciklama);
    return interaction.reply({ content: `✅ Dava talebiniz oluşturuldu!\n⚖️ Dava No: \`${dava_no}\`\n📋 Konu: ${konu}\n\nMahkeme yetkilisi en kısa sürede inceleyecektir.`, ephemeral: true });
  }

  // İtiraz
  if (customId === 'modal_itiraz') {
    const dava_no = interaction.fields.getTextInputValue('dava_no').trim();
    const itiraz_sebebi = interaction.fields.getTextInputValue('itiraz_sebebi').trim();
    const dava = db.prepare('SELECT * FROM court_cases WHERE dava_no = ? AND guild_id = ?').get(dava_no, guildId);
    if (!dava) return interaction.reply({ content: `❌ \`${dava_no}\` numaralı dava bulunamadı.`, ephemeral: true });
    db.prepare(`INSERT INTO applications (discord_id, guild_id, basvuru_turu, icerik) VALUES (?, ?, ?, ?)`)
      .run(user.id, guildId, `İtiraz - ${dava_no}`, itiraz_sebebi);
    return interaction.reply({ content: `✅ İtiraz talebiniz alındı.\n⚖️ Dava No: \`${dava_no}\`\nMahkeme yetkilisi inceleyecektir.`, ephemeral: true });
  }

  // Bilet
  if (customId.startsWith('modal_bilet_')) {
    const tur = customId.replace('modal_bilet_', '');
    const konu = interaction.fields.getTextInputValue('konu').trim();
    const aciklama = interaction.fields.getTextInputValue('aciklama').trim();
    const turNames = { sikayet: 'Şikayet', destek: 'Destek', yetkili_basvuru: 'Yetkili Başvurusu', ruhsat_basvuru: 'Ruhsat Başvurusu', polis_ihbar: 'Polis İhbarı' };
    db.prepare(`INSERT INTO tickets (discord_id, guild_id, konu, tur, aciklama) VALUES (?, ?, ?, ?, ?)`)
      .run(user.id, guildId, konu, turNames[tur] || tur, aciklama);
    return interaction.reply({ content: `✅ **${turNames[tur] || tur}** talebiniz alındı!\n📋 Konu: ${konu}\n\nYetkililerimiz en kısa sürede size ulaşacaktır.`, ephemeral: true });
  }
}

module.exports = { handleModal };

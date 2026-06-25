const { EmbedBuilder } = require('discord.js');
const { db } = require('../database/db');
const { getCitizen, formatDate, isPolice, isMunicipality, isCourt } = require('../utils/helpers');
const {
  kimlikOlusturModal, ruhsatBasvuruModal, isletmeBasvuruModal,
  polisIhbarModal, davaAcModal, itirazModal, biletModal, sorgulaModal
} = require('../utils/modals');

async function handleButton(interaction, client) {
  const { customId, user, guildId, member } = interaction;

  // Vatandaş Paneli
  if (customId === 'vatandas_kimlik_olustur') {
    const existing = getCitizen(user.id, guildId);
    if (existing) {
      return interaction.reply({ content: '❌ Zaten kayıtlı bir kimliğiniz var!', ephemeral: true });
    }
    return interaction.showModal(kimlikOlusturModal());
  }

  if (customId === 'vatandas_kimlik_goruntule') {
    const citizen = getCitizen(user.id, guildId);
    if (!citizen) {
      return interaction.reply({ content: '❌ Kayıtlı kimliğiniz bulunamadı. Önce kimlik oluşturun.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle('🪪 Kimlik Bilgileri')
      .setColor(0x3498db)
      .addFields(
        { name: '👤 Ad Soyad', value: `${citizen.ad} ${citizen.soyad}`, inline: true },
        { name: '🔢 Kimlik No', value: citizen.kimlik_no, inline: true },
        { name: '🎂 Doğum Tarihi', value: citizen.dogum_tarihi, inline: true },
        { name: '⚧ Cinsiyet', value: citizen.cinsiyet, inline: true },
        { name: '💼 Meslek', value: citizen.meslek || 'İşsiz', inline: true },
        { name: '📅 Kayıt Tarihi', value: formatDate(citizen.created_at), inline: true }
      )
      .setFooter({ text: `Discord: ${user.tag}` })
      .setTimestamp();
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (customId === 'vatandas_basvurularim') {
    const apps = db.prepare('SELECT * FROM applications WHERE discord_id = ? AND guild_id = ? ORDER BY tarih DESC LIMIT 10').all(user.id, guildId);
    if (!apps.length) {
      return interaction.reply({ content: '📭 Aktif başvurunuz bulunmamaktadır.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle('📋 Başvurularım')
      .setColor(0x3498db)
      .setDescription(apps.map(a => `**${a.basvuru_turu}** — ${a.durum}\n📅 ${formatDate(a.tarih)}`).join('\n\n'))
      .setTimestamp();
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (customId === 'vatandas_bilgileri') {
    const citizen = getCitizen(user.id, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Kayıtlı kimliğiniz bulunamadı.', ephemeral: true });
    const licenses = db.prepare('SELECT * FROM licenses WHERE discord_id = ? AND guild_id = ?').all(user.id, guildId);
    const crimes = db.prepare('SELECT COUNT(*) as cnt FROM criminal_records WHERE discord_id = ? AND guild_id = ?').get(user.id, guildId);
    const embed = new EmbedBuilder()
      .setTitle('📄 Vatandaş Bilgileri')
      .setColor(0x3498db)
      .addFields(
        { name: '👤 Ad Soyad', value: `${citizen.ad} ${citizen.soyad}`, inline: true },
        { name: '🔢 Kimlik No', value: citizen.kimlik_no, inline: true },
        { name: '💼 Meslek', value: citizen.meslek || 'İşsiz', inline: true },
        { name: '📜 Ruhsatlar', value: licenses.length ? licenses.map(l => `${l.lisans_turu} (${l.durum})`).join(', ') : 'Yok', inline: false },
        { name: '⚠️ Sabıka Sayısı', value: crimes.cnt.toString(), inline: true }
      )
      .setTimestamp();
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Belediye Paneli
  if (customId === 'belediye_ruhsat_basvuru') {
    const citizen = getCitizen(user.id, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Ruhsat başvurusu için önce kimlik oluşturmanız gerekiyor.', ephemeral: true });
    return interaction.showModal(ruhsatBasvuruModal('Ehliyet'));
  }

  if (customId === 'belediye_isletme_basvuru') {
    const citizen = getCitizen(user.id, guildId);
    if (!citizen) return interaction.reply({ content: '❌ İşletme başvurusu için önce kimlik oluşturmanız gerekiyor.', ephemeral: true });
    return interaction.showModal(isletmeBasvuruModal());
  }

  if (customId === 'belediye_ruhsat_sorgula') {
    return interaction.showModal(sorgulaModal('ruhsat'));
  }

  // Polis Paneli
  if (customId === 'polis_ihbar') {
    return interaction.showModal(polisIhbarModal());
  }

  if (customId === 'polis_sabika_sorgula') {
    return interaction.showModal(sorgulaModal('sabika'));
  }

  if (customId === 'polis_aranan_sorgula') {
    return interaction.showModal(sorgulaModal('aranan'));
  }

  // Mahkeme Paneli
  if (customId === 'mahkeme_dava_ac') {
    const citizen = getCitizen(user.id, guildId);
    if (!citizen) return interaction.reply({ content: '❌ Dava açmak için önce kimlik oluşturmanız gerekiyor.', ephemeral: true });
    return interaction.showModal(davaAcModal());
  }

  if (customId === 'mahkeme_itiraz') {
    return interaction.showModal(itirazModal());
  }

  if (customId === 'mahkeme_dava_durum') {
    const cases = db.prepare('SELECT * FROM court_cases WHERE (davaci_id = ? OR davali_id = ?) AND guild_id = ? ORDER BY tarih DESC LIMIT 5').all(user.id, user.id, guildId);
    if (!cases.length) return interaction.reply({ content: '📭 Adınıza kayıtlı dava bulunmamaktadır.', ephemeral: true });
    const embed = new EmbedBuilder()
      .setTitle('⚖️ Dava Durumlarım')
      .setColor(0x9b59b6)
      .setDescription(cases.map(c => `**${c.dava_no}** — ${c.durum}\n📋 ${c.konu}\n📅 ${formatDate(c.tarih)}`).join('\n\n'))
      .setTimestamp();
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Bilet Paneli
  if (customId === 'bilet_sikayet') return interaction.showModal(biletModal('sikayet'));
  if (customId === 'bilet_destek') return interaction.showModal(biletModal('destek'));
  if (customId === 'bilet_yetkili_basvuru') return interaction.showModal(biletModal('yetkili_basvuru'));
  if (customId === 'bilet_ruhsat_basvuru') return interaction.showModal(biletModal('ruhsat_basvuru'));
  if (customId === 'bilet_polis_ihbar') return interaction.showModal(biletModal('polis_ihbar'));
}

module.exports = { handleButton };

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function kimlikOlusturModal() {
  return new ModalBuilder()
    .setCustomId('modal_kimlik_olustur')
    .setTitle('Kimlik Oluştur')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('ad').setLabel('Adınız').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('soyad').setLabel('Soyadınız').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('dogum_tarihi').setLabel('Doğum Tarihi (GG/AA/YYYY)').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('01/01/2000')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('cinsiyet').setLabel('Cinsiyet (Erkek/Kadın)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(10)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('meslek').setLabel('Meslek').setStyle(TextInputStyle.Short).setRequired(false).setPlaceholder('İşsiz')
      )
    );
}

function ruhsatBasvuruModal(tur = 'Ehliyet') {
  return new ModalBuilder()
    .setCustomId(`modal_ruhsat_basvuru_${tur}`)
    .setTitle(`${tur} Başvurusu`)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('lisans_turu').setLabel('Lisans/Ruhsat Türü').setStyle(TextInputStyle.Short).setRequired(true).setValue(tur)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('aciklama').setLabel('Ek Bilgi').setStyle(TextInputStyle.Paragraph).setRequired(false).setMaxLength(500)
      )
    );
}

function isletmeBasvuruModal() {
  return new ModalBuilder()
    .setCustomId('modal_isletme_basvuru')
    .setTitle('İşletme Başvurusu')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('isletme_adi').setLabel('İşletme Adı').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('isletme_turu').setLabel('İşletme Türü').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('adres').setLabel('Adres').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200)
      )
    );
}

function polisIhbarModal() {
  return new ModalBuilder()
    .setCustomId('modal_polis_ihbar')
    .setTitle('Polis İhbarı')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('konu').setLabel('Olay Konusu').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('konum').setLabel('Konum').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('aciklama').setLabel('Olayı Açıklayın').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)
      )
    );
}

function sabikaEkleModal() {
  return new ModalBuilder()
    .setCustomId('modal_sabika_ekle')
    .setTitle('Sabıka Kaydı Ekle')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('hedef_id').setLabel('Vatandaş Discord ID').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('suc_turu').setLabel('Suç Türü').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('aciklama').setLabel('Açıklama').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('ceza').setLabel('Ceza').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200)
      )
    );
}

function arananEkleModal() {
  return new ModalBuilder()
    .setCustomId('modal_aranan_ekle')
    .setTitle('Aranan Kaydı Ekle')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('hedef_id').setLabel('Vatandaş Discord ID').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('sebep').setLabel('Aranma Sebebi').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500)
      )
    );
}

function davaAcModal() {
  return new ModalBuilder()
    .setCustomId('modal_dava_ac')
    .setTitle('Dava Açma Talebi')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('davali_id').setLabel('Davalı Discord ID').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('konu').setLabel('Dava Konusu').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('aciklama').setLabel('Dava Açıklaması').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)
      )
    );
}

function itirazModal() {
  return new ModalBuilder()
    .setCustomId('modal_itiraz')
    .setTitle('İtiraz Talebi')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('dava_no').setLabel('Dava No').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('itiraz_sebebi').setLabel('İtiraz Sebebi').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)
      )
    );
}

function biletModal(tur) {
  const titles = {
    sikayet: 'Şikayet',
    destek: 'Destek Talebi',
    yetkili_basvuru: 'Yetkili Başvurusu',
    ruhsat_basvuru: 'Ruhsat Başvurusu',
    polis_ihbar: 'Polis İhbarı'
  };
  return new ModalBuilder()
    .setCustomId(`modal_bilet_${tur}`)
    .setTitle(titles[tur] || 'Başvuru')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('konu').setLabel('Konu').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('aciklama').setLabel('Açıklama').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)
      )
    );
}

function sorgulaModal(tur) {
  const titles = { sabika: 'Sabıka Sorgula', aranan: 'Aranan Sorgula', ruhsat: 'Ruhsat Sorgula', vatandas: 'Vatandaş Sorgula' };
  return new ModalBuilder()
    .setCustomId(`modal_sorgula_${tur}`)
    .setTitle(titles[tur] || 'Sorgula')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('discord_id').setLabel('Discord ID veya Kimlik No').setStyle(TextInputStyle.Short).setRequired(true)
      )
    );
}

module.exports = { kimlikOlusturModal, ruhsatBasvuruModal, isletmeBasvuruModal, polisIhbarModal, sabikaEkleModal, arananEkleModal, davaAcModal, itirazModal, biletModal, sorgulaModal };

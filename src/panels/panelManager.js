const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { db } = require('../database/db');

const PANEL_TYPES = {
  vatandas: {
    baslik: '🏛️ Vatandaş Paneli',
    aciklama: 'Aşağıdaki butonları kullanarak vatandaşlık işlemlerinizi gerçekleştirebilirsiniz.',
    renk: 0x3498db,
    buttons: [
      { id: 'vatandas_kimlik_olustur', label: 'Kimlik Oluştur', emoji: '🪪', style: ButtonStyle.Primary },
      { id: 'vatandas_kimlik_goruntule', label: 'Kimlik Görüntüle', emoji: '👁️', style: ButtonStyle.Secondary },
      { id: 'vatandas_basvurularim', label: 'Başvurularım', emoji: '📋', style: ButtonStyle.Secondary },
      { id: 'vatandas_bilgileri', label: 'Vatandaş Bilgileri', emoji: '📄', style: ButtonStyle.Secondary },
    ]
  },
  belediye: {
    baslik: '🏢 Belediye Paneli',
    aciklama: 'Belediye işlemleriniz için aşağıdaki seçenekleri kullanın.',
    renk: 0x2ecc71,
    buttons: [
      { id: 'belediye_ruhsat_basvuru', label: 'Ruhsat Başvurusu', emoji: '📝', style: ButtonStyle.Primary },
      { id: 'belediye_isletme_basvuru', label: 'İşletme Başvurusu', emoji: '🏪', style: ButtonStyle.Primary },
      { id: 'belediye_ruhsat_sorgula', label: 'Ruhsat Sorgulama', emoji: '🔍', style: ButtonStyle.Secondary },
    ]
  },
  polis: {
    baslik: '🚔 Polis Paneli',
    aciklama: 'Polis işlemleri için aşağıdaki butonları kullanın.',
    renk: 0xe74c3c,
    buttons: [
      { id: 'polis_ihbar', label: 'Polis İhbarı', emoji: '🚨', style: ButtonStyle.Danger },
      { id: 'polis_sabika_sorgula', label: 'Sabıka Sorgulama', emoji: '📋', style: ButtonStyle.Secondary },
      { id: 'polis_aranan_sorgula', label: 'Aranan Sorgulama', emoji: '🔎', style: ButtonStyle.Secondary },
    ]
  },
  mahkeme: {
    baslik: '⚖️ Mahkeme Paneli',
    aciklama: 'Hukuki işlemleriniz için aşağıdaki seçenekleri kullanın.',
    renk: 0x9b59b6,
    buttons: [
      { id: 'mahkeme_dava_ac', label: 'Dava Açma Talebi', emoji: '⚖️', style: ButtonStyle.Primary },
      { id: 'mahkeme_itiraz', label: 'İtiraz Talebi', emoji: '✋', style: ButtonStyle.Primary },
      { id: 'mahkeme_dava_durum', label: 'Dava Durumu', emoji: '📊', style: ButtonStyle.Secondary },
    ]
  },
  bilet: {
    baslik: '🎫 Destek & Başvuru Paneli',
    aciklama: 'Yardım almak veya başvuru yapmak için aşağıdaki kategorilerden birini seçin.',
    renk: 0xf39c12,
    buttons: [
      { id: 'bilet_sikayet', label: 'Şikayet', emoji: '⚠️', style: ButtonStyle.Danger },
      { id: 'bilet_destek', label: 'Destek', emoji: '🆘', style: ButtonStyle.Primary },
      { id: 'bilet_yetkili_basvuru', label: 'Yetkili Başvurusu', emoji: '👮', style: ButtonStyle.Secondary },
      { id: 'bilet_ruhsat_basvuru', label: 'Ruhsat Başvurusu', emoji: '📝', style: ButtonStyle.Secondary },
      { id: 'bilet_polis_ihbar', label: 'Polis İhbarı', emoji: '🚨', style: ButtonStyle.Danger },
    ]
  }
};

function buildPanelEmbed(panelConfig, override = {}) {
  const config = PANEL_TYPES[panelConfig.panel_turu] || {};
  return new EmbedBuilder()
    .setTitle(override.baslik || panelConfig.baslik || config.baslik)
    .setDescription(override.aciklama || panelConfig.aciklama || config.aciklama)
    .setColor(override.renk || parseInt(panelConfig.renk?.replace('#',''), 16) || config.renk || 0x5865F2)
    .setFooter({ text: 'Şehir Botu • Panel Sistemi' })
    .setTimestamp();
}

function buildPanelComponents(panelType) {
  const config = PANEL_TYPES[panelType];
  if (!config) return [];
  const rows = [];
  const buttons = config.buttons;
  for (let i = 0; i < buttons.length; i += 4) {
    const row = new ActionRowBuilder();
    buttons.slice(i, i + 4).forEach(b => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(b.id)
          .setLabel(b.label)
          .setEmoji(b.emoji)
          .setStyle(b.style)
      );
    });
    rows.push(row);
  }
  return rows;
}

async function restorePanels(client) {
  const panels = db.prepare('SELECT * FROM panels WHERE message_id IS NOT NULL').all();
  for (const panel of panels) {
    try {
      const guild = await client.guilds.fetch(panel.guild_id).catch(() => null);
      if (!guild) continue;
      const channel = await guild.channels.fetch(panel.channel_id).catch(() => null);
      if (!channel) continue;
      const message = await channel.messages.fetch(panel.message_id).catch(() => null);
      if (!message) {
        // Mesaj silinmiş, yeniden gönder
        const embed = buildPanelEmbed(panel);
        const components = buildPanelComponents(panel.panel_turu);
        const sent = await channel.send({ embeds: [embed], components });
        db.prepare('UPDATE panels SET message_id = ? WHERE id = ?').run(sent.id, panel.id);
      }
    } catch (err) {
      console.error(`[PANEL] Geri yükleme hatası (ID: ${panel.id}):`, err.message);
    }
  }
}

async function sendPanel(channel, panelType, options = {}) {
  const config = PANEL_TYPES[panelType];
  if (!config) throw new Error('Geçersiz panel türü.');
  const fakePanel = { panel_turu: panelType, baslik: null, aciklama: null, renk: null };
  const embed = buildPanelEmbed(fakePanel, options);
  const components = buildPanelComponents(panelType);
  return await channel.send({ embeds: [embed], components });
}

module.exports = { PANEL_TYPES, buildPanelEmbed, buildPanelComponents, restorePanels, sendPanel };

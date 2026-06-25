const { db } = require('../database/db');

function generateKimlikNo() {
  return 'TR' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateRuhsatNo(tur) {
  const prefix = tur.substring(0, 2).toUpperCase();
  return prefix + Date.now().toString().slice(-8);
}

function generateDavaNo() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DAVA-${year}-${rand}`;
}

function getCitizen(discordId, guildId) {
  return db.prepare('SELECT * FROM citizens WHERE discord_id = ? AND guild_id = ?').get(discordId, guildId);
}

function getServerSettings(guildId) {
  return db.prepare('SELECT * FROM server_settings WHERE guild_id = ?').get(guildId);
}

function hasRole(member, roleId) {
  if (!roleId) return false;
  return member.roles.cache.has(roleId);
}

function isPolice(member, guildId) {
  const settings = getServerSettings(guildId);
  return settings && hasRole(member, settings.polis_rol);
}

function isMunicipality(member, guildId) {
  const settings = getServerSettings(guildId);
  return settings && hasRole(member, settings.belediye_rol);
}

function isCourt(member, guildId) {
  const settings = getServerSettings(guildId);
  return settings && hasRole(member, settings.mahkeme_rol);
}

function isAuthority(member, guildId) {
  const settings = getServerSettings(guildId);
  return settings && (hasRole(member, settings.yetkili_rol) || member.permissions.has('Administrator'));
}

function formatDate(dateStr) {
  if (!dateStr) return 'Bilinmiyor';
  return new Date(dateStr).toLocaleString('tr-TR');
}

module.exports = { generateKimlikNo, generateRuhsatNo, generateDavaNo, getCitizen, getServerSettings, hasRole, isPolice, isMunicipality, isCourt, isAuthority, formatDate };

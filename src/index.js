require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./database/db');
const { restorePanels } = require('./panels/panelManager');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();

function loadCommands() {
  const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
  for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, 'commands', folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }
  return [...client.commands.values()].map(c => c.data.toJSON());
}

async function deployCommands(commandJsonArray) {
  const token    = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!token || !clientId) {
    console.warn('[DEPLOY] DISCORD_TOKEN veya DISCORD_CLIENT_ID eksik — komutlar kaydedilmedi.');
    return;
  }
  try {
    const rest = new REST().setToken(token);
    console.log(`[DEPLOY] ${commandJsonArray.length} slash komutu Discord'a kaydediliyor...`);
    const data = await rest.put(Routes.applicationCommands(clientId), { body: commandJsonArray });
    console.log(`[DEPLOY] ${data.length} komut başarıyla kaydedildi!`);
  } catch (err) {
    console.error('[DEPLOY] Komut kayıt hatası:', err.message);
  }
}

const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(__dirname, 'events', file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`[BOT] ${c.user.tag} olarak giriş yapıldı!`);
  initDatabase();
  await restorePanels(client);
  console.log('[BOT] Tüm paneller geri yüklendi.');
});

(async () => {
  const commandJsonArray = loadCommands();
  await deployCommands(commandJsonArray);
  client.login(process.env.DISCORD_TOKEN);
})();

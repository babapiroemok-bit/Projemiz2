require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));

for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data) commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`[DEPLOY] ${commands.length} slash komutu yükleniyor...`);
    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    console.log(`[DEPLOY] ${data.length} komut başarıyla yüklendi!`);
  } catch (error) {
    console.error('[DEPLOY] Hata:', error);
  }
})();

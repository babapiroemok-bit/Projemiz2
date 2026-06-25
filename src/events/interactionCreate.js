const { Events } = require('discord.js');
const { handleButton } = require('../handlers/buttonHandler');
const { handleModal } = require('../handlers/modalHandler');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
      } else if (interaction.isButton()) {
        await handleButton(interaction, client);
      } else if (interaction.isModalSubmit()) {
        await handleModal(interaction, client);
      }
    } catch (err) {
      console.error('[INTERACTION] Hata:', err);
      const msg = { content: '❌ Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => {});
      } else {
        await interaction.reply(msg).catch(() => {});
      }
    }
  }
};

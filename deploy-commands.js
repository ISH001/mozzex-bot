const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(config.token);

(async () => {
  try {
    console.log(`[Deploy] Refreshing ${commands.length} application (/) commands...`);

    if (config.guildId) {
      // Guild-specific deployment (instant)
      const data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
      console.log(`[Deploy] Successfully reloaded ${data.length} commands to Guild ${config.guildId}!`);
    } else {
      // Global deployment (takes a few minutes to propagate across all servers)
      const data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
      console.log(`[Deploy] Successfully reloaded ${data.length} global application (/) commands!`);
    }
  } catch (error) {
    console.error('[Deploy Error]', error);
  }
})();

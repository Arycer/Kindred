const { REST, Routes, Events } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Bot iniciado como ${client.user.tag}!`);
        const commandFiles = readdirSync(join(__dirname, '..', 'commands')).filter(file => file.endsWith('.js'));

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        const commands = [];

        for (const file of commandFiles) {
            const command_file = join(__dirname, '..', 'commands', file);
            const command = require(command_file);
            commands.push(command.data.toJSON());
        }

        (async () => {
            try {
                console.log(`Actualizando ${commands.length} interacciones (/).`);

                data = await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: commands },
                );

                console.log(`${data.length} interacciones (/) han sido actualizadas.`);
            } catch (error) {
                console.error(error);
            }
        })();
    },
};

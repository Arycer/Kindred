const { REST, Routes, Events, ActivityType } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Bot iniciado como ${client.user.tag}!`);

        const music_cmds_files = readdirSync(join(__dirname, '..', 'music', 'commands')).filter(file => file.endsWith('.js'));
        const league_cmds_files = readdirSync(join(__dirname, '..', 'league', 'commands')).filter(file => file.endsWith('.js'));

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        const commands = [];

        for (const file of music_cmds_files) {
            const cmd_file = join(__dirname, '..', 'music', 'commands', file);
            const cmd = require(cmd_file);
            commands.push(cmd.data.toJSON());
        }

        for (const file of league_cmds_files) {
            const cmd_file = join(__dirname, '..', 'league', 'commands', file);
            const cmd = require(cmd_file);
            commands.push(cmd.data.toJSON());
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

        client.user.setActivity(`a Lobo | /help`, { type: ActivityType.Listening });
    },
};
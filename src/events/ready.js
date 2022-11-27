const { REST, Routes, Events, ActivityType } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
var axios = require('axios');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Bot iniciado como ${client.user.tag}!`);

		const cmd_dir = join(__dirname, '..', 'commands');
		const cmd_files = readdirSync(cmd_dir)
			.filter(file => file.endsWith('.js'));

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        const commands = [];

		for (const file of cmd_files) {
			const cmd_file = join(cmd_dir, file);
			const cmd = require(cmd_file);
			commands.push(cmd.data.toJSON());
		}

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

        var endpoint = `https://ddragon.leagueoflegends.com/api/versions.json`;
        var version = await axios.get(endpoint);
        var version = version.data[0];

        const activities = [
            { name: `a Lobo | /help`, type: ActivityType.Listening },
            { name: `parche ${version} | /help`, type: ActivityType.Watching },
            { name: `a ${client.guilds.cache.size} servidores y ${client.users.cache.size} usuarios | /help`, type: ActivityType.Watching },
        ];

        var i = 0;
        setInterval(() => client.user.setActivity(activities[i++ % activities.length]), 15000);
    }
};
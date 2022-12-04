const { REST, Routes, Events, ActivityType } = require('discord.js');
const LastGames = require('../league/classes/last_games');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const MeowDB = require('meowdb');
var axios = require('axios');

const db = new MeowDB({
    dir: 'src/database',
    name: 'accounts',
    raw: true,
});

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

            console.log(`${data.length} interacciones (/) actualizadas.`);
        } catch (error) {
            console.error(error);
        }

        var endpoint = `https://ddragon.leagueoflegends.com/api/versions.json`;
        var version = await axios.get(endpoint);
        var version = version.data[0];

		const activities = [
            { name: `a Lobo | /help`, type: ActivityType.Listening },
            { name: `parche ${version} | /help`, type: ActivityType.Watching },
            { name: `a ${client.guilds.cache.size} servidores | /help`, type: ActivityType.Watching },
        ];

        var i = 0;
        setInterval(() => {
            activities[2].name = `${client.guilds.cache.size} servidores | /help`;
            client.user.setActivity(activities[i++ % activities.length]);
        }, 15 * 1000);

        update_games();
        setInterval(update_games, 60 * 60 * 1000);
    }
};

async function update_games () {
    var accounts = Object.values(db.all());
    console.log('[%s] Actualizando partidas', new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }));
    for (var i = 0; i < accounts.length; i++) {
        var account = accounts[i];
        var last_games = new LastGames();
        try {
            await last_games.get_last_games(account.region, account.summoner.identifiers.puuid);
        } catch (error) {
            console.log(error);
            continue;
        }
    }
    console.log('[%s] Partidas actualizadas', new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }));
}
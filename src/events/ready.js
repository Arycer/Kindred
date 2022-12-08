const { REST, Routes, Events, ActivityType } = require('discord.js');
const LastGames = require('../util/classes/league/last_games');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const MeowDB = require('meowdb');
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

            console.log(`${data.length} interacciones (/) actualizadas.`);
        } catch (error) {
            console.error(error);
        }

        var endpoint = `https://ddragon.leagueoflegends.com/api/versions.json`;
        var version = await axios.get(endpoint);
        var version = version.data[0];
        var patch = version.split('.')[0] + '.' + version.split('.')[1];

		const activities = [
            { name: `a Lobo | /help`, type: ActivityType.Listening },
            { name: `parche ${patch} | /help`, type: ActivityType.Watching },
            { name: `{{count}} servidores | /help`, type: ActivityType.Watching }
        ];

        var i = 0;
        setInterval(() => {
            client.user.setActivity({
                name: activities[i].name.replace('{{count}}', client.guilds.cache.size),
                type: activities[i].type
            });
            i++ >= activities.length - 1 ? i = 0 : i;
        }, 7.5 * 1000);

        update_games();
        setInterval(update_games, 60 * 60 * 1000);
    }
};

const Region = require('../util/classes/league/region');
const userdata = new MeowDB({
    dir: 'src/database',
    name: 'userdata',
    raw: true,
});

async function update_games () {
    var users = Object.values(userdata.all());
    console.log('[%s] Actualizando partidas', new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }));
    for (var i = 0; i < users.length; i++) {
        if (!users[i].league) continue;
        var user = users[i];
        try {
            var last_games = new LastGames();
            var region = new Region().get_region(user.league.region);
            await last_games.get_last_games(region, user.league.puuid);
        } catch (error) {
            console.log(error);
            continue;
        }
    }
    console.log('[%s] Partidas actualizadas', new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }));
}
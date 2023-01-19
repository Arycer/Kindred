const { REST, Routes, Events, ActivityType } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
const MeowDB = require('meowdb');
const axios = require('axios');

global.db = {
    userLang: new MeowDB({
        dir: './database/',
        name: 'userLang',
    }),
    guildLang: new MeowDB({
        dir: './database/',
        name: 'guildLang',
    }),
    linkedLeague: new MeowDB({
        dir: './database/',
        name: 'linkedLeague',
    }),
    matchesCache: new MeowDB({
        dir: './database/',
        name: 'matchesCache',
    })
}

global.riotAxiosOptions = {
    method: 'GET',
    timeout: 2000,
    headers: { 'X-Riot-Token': process.env.RIOT_Secret },
};

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log('Bot iniciado como', client.user.tag);

        const cmd_path = join(__dirname, '..', 'cmds');
        const cmd_files = readdirSync(cmd_path)
            .filter(file => file.endsWith('.js'));

        const rest = new REST({ version: '10'}).setToken(process.env.BOT_Secret);
        const cmds = [];

        cmd_files.forEach(file => {
            const cmd = require(join(cmd_path, file));
            cmds.push(cmd.data.toJSON());
        });

        try {
            console.log('Actualizando', cmds.length, 'interacciones (/)');

            data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: cmds }
            );

            console.log(data.length, 'interacciones (/) actualizadas');
        } catch (error) {
            console.error(error);
        }

        var lolPatchEndpoint = 'https://ddragon.leagueoflegends.com/api/versions.json',
            lolPatchData = await axios.get(lolPatchEndpoint),
            lolVersion = lolPatchData.data[0],
            lolPatch = lolVersion.split('.')[0] + '.' + lolVersion.split('.')[1];

        var activities = [
            { name: 'a Lobo', type: ActivityType.Watching },
            { name: `parche ${lolPatch}`, type: ActivityType.Playing },
            { name: `${client.guilds.cache.size} servidores`, type: ActivityType.Watching },
        ];

        activities.forEach(activity => {
            activity.name = activity.name + ' | /help';
        });

        var i = 0;
        setInterval(async () => {
            client.user.setActivity(activities[i]);
            i++ >= activities.length - 1 ? i = 0 : i;
        }, 7.5 * 1000);
    }
};
const { SlashCommandBuilder, EmbedBuilder, TimestampStyles, time, Embed } = require('discord.js');
const get_emote = require('../util/league/functions/get_emote');
const error = require('../util/error.js');
const { join } = require('node:path');
const MeowDB = require('meowdb');
const fs = require('fs');

const whitelist = new MeowDB({
    name: 'tournament_whitelist',
    dir: 'src/database',
});

const data = new SlashCommandBuilder()
    .setName('tournament').setNameLocalization('es-ES', 'torneo')
    .setDescription('Comandos de torneos');
    
const cmd_dir = join(__dirname, 'tournament');
const cmd_files = fs.readdirSync(cmd_dir)
    .filter(file => file.endsWith('.js'));

for (const file of cmd_files) {
    const cmd_file = join(cmd_dir, file);
    const cmd = require(cmd_file);
    data.addSubcommand(cmd.data);
}

module.exports = {
    data: data,
    async execute(interaction) {
        var whitelisted = whitelist.get(interaction.user.id);
        if (!whitelisted && interaction.user.id != process.env.OWNER_ID) return interaction.followUp({ embeds: [error('No tienes acceso a los comandos de torneos.', interaction.user.tag)] });

        for (const file of cmd_files) {
            const cmd_file = join(cmd_dir, file);
            const cmd = require(cmd_file);
            if (interaction.options.getSubcommand() === cmd.data.name) {
                await cmd.execute(interaction);
            }
        }
    }
};

const TournamentGame = require('../util/league/classes/tournament');
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

const model = require('../util/tournament_model.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ] });
client.login(process.env.DISCORD_TOKEN);

const server = http.createServer(async (req, res) => {
    if (req.url == '/riot.txt') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('a5c2440c-b15d-4d77-8e10-3782da5d137c');
        return;
    } else if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    var url = req.url.split('/');
    if (url[1] !== 'api' || url[2] !== 'v1' || url[3] !== 'tournaments') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
    }

    var body = '';
    req.on('data', (chunk) => {
        for (const key of Object.keys(model)) {
            if (!chunk.includes(key)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bad Request' }));
                return;
            }
        }
        body += chunk;
    });

    var game = new TournamentGame();
    req.on('end', async () => {
        if (body === '') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad Request' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK'}));

        console.log(`[%s] Petición recibida con éxito a %s`, new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }), req.url);

        var match = JSON.parse(body);

        try {
            await game.init(match);
            var locale = require(`../locales/${game.lang}.json`);
            var localized_data = locale.tournament_results;
            var cs_emote = get_emote('cs');

            var embed = new EmbedBuilder()
                .setAuthor(localized_data.embed.author)
                .setTitle(game.title)
                .setDescription(
                    localized_data.embed.description
                        .replace('{{map}}', locale.maps[game.map])
                        .replace('{{date}}', time(new Date(game.timestamp), TimestampStyles.ShortDateTime))
                    )
                .setFooter({ text: localized_data.embed.footer.text })
                .setColor(localized_data.embed.color)
                .setTimestamp();

            for (var i = 0; i < game.participants.winningTeam.length; i++) {
                var player = game.participants.winningTeam[i];
                var summoner = player.summoner;
                var match = player.match;
                var champ = match.champion;

                embed.addFields({
                    name: localized_data.fields.name
                        .replace('{{team}}', '🔵')
                        .replace('{{name}}', summoner.name)
                        .replace('{{kills}}', match.stats.kills)
                        .replace('{{deaths}}', match.stats.deaths)
                        .replace('{{assists}}', match.stats.assists)
                        .replace('{{cs_emote}}', cs_emote)
                        .replace('{{cs}}', match.stats.cs)
                        .replace('{{cspm}}', match.stats.cspm),
                    value: localized_data.fields.value
                        .replace('{{emote}}', champ.emote)
                        .replace('{{champion}}', champ.name)
                        .replace('{{spell1}}', match.spells.spell1.emote)
                        .replace('{{spell2}}', match.spells.spell2.emote)
                        .replace('{{trinket}}', match.inventory.trinket.emote)
                        .replace('{{item1}}', match.inventory.items[0].emote)
                        .replace('{{item2}}', match.inventory.items[1].emote)
                        .replace('{{item3}}', match.inventory.items[2].emote)
                        .replace('{{item4}}', match.inventory.items[3].emote)
                        .replace('{{item5}}', match.inventory.items[4].emote)
                        .replace('{{item6}}', match.inventory.items[5].emote),
                    inline: false
                });
            }

            for (var i = 0; i < game.participants.losingTeam.length; i++) {
                var player = game.participants.losingTeam[i];
                var summoner = player.summoner;
                var match = player.match;
                var champ = match.champion;

                embed.addFields({
                    name: localized_data.fields.name
                        .replace('{{team}}', '🔴')
                        .replace('{{name}}', summoner.name)
                        .replace('{{kills}}', match.stats.kills)
                        .replace('{{deaths}}', match.stats.deaths)
                        .replace('{{assists}}', match.stats.assists)
                        .replace('{{cs_emote}}', cs_emote)
                        .replace('{{cs}}', match.stats.cs)
                        .replace('{{cspm}}', match.stats.cspm),
                    value: localized_data.fields.value
                        .replace('{{emote}}', champ.emote)
                        .replace('{{champion}}', champ.name)
                        .replace('{{spell1}}', match.spells.spell1.emote)
                        .replace('{{spell2}}', match.spells.spell2.emote)
                        .replace('{{trinket}}', match.inventory.trinket.emote)
                        .replace('{{item1}}', match.inventory.items[0].emote)
                        .replace('{{item2}}', match.inventory.items[1].emote)
                        .replace('{{item3}}', match.inventory.items[2].emote)
                        .replace('{{item4}}', match.inventory.items[3].emote)
                        .replace('{{item5}}', match.inventory.items[4].emote)
                        .replace('{{item6}}', match.inventory.items[5].emote),
                    inline: false
                });
            }
            var post_channel = client.channels.cache.get(game.channel);
            post_channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(err);
        }
    });
});

var port = 8080;
server.listen(port, () => {
    console.log('Servidor iniciado en el puerto %d', port);
});

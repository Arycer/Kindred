const { SlashCommandBuilder } = require('discord.js');
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

const TournamentGame = require('../league/classes/tournament');
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

const model = require('../util/tournament_model.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ] });
client.login(process.env.DISCORD_TOKEN);

const ssl = fs.readFileSync(join(__dirname, '..', 'ssl', 'ssl.pem'));
const options = {
    key: ssl,
    cert: ssl
};

const server = http.createServer(options, async (req, res) => {
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
            const post_channel = client.channels.cache.get(game.channel);

            var lang = game.lang;
            var embed_creator = require(`./etc/${lang}/make-tournament-embed.js`);

            var embed = await embed_creator(game);
            return await post_channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(err);
        }
    });
});

var port = 8080;
server.listen(port, () => {
    console.log('Servidor iniciado en el puerto %d', port);
});

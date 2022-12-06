const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const get_emote = require('../../util/league/functions/get_emote');
const LastGames = require('../../util/league/classes/last_games');
const get_user = require('../../util/league/functions/get_user');
const Summoner = require('../../util/league/classes/summoner');
const Region = require('../../util/league/classes/region');
const error = require('../../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('history').setNameLocalizations({
            'es-ES': 'historial',
        })
        .setDescription('Shows the 10 last games of a player')
        .setDescriptionLocalizations({
            'es-ES': 'Muestra las 10 últimas partidas de un jugador',
        })
        .addStringOption(option => option
            .setName('region').setNameLocalizations({
                'es-ES': 'región',
            })
            .setDescription('Player region').setDescriptionLocalizations({
                'es-ES': 'Región del jugador',
            })
            .setRequired(false)
            .addChoices(
                { name: 'EUW', value: 'euw1' },
                { name: 'EUNE', value: 'eun1' },
                { name: 'NA', value: 'na1' },
                { name: 'BR', value: 'br1' },
                { name: 'LAN', value: 'la1' },
                { name: 'LAS', value: 'la2' },
                { name: 'OCE', value: 'oc1' },
                { name: 'TR', value: 'tr1' },
                { name: 'RU', value: 'ru' },
                { name: 'JP', value: 'jp1' },
                { name: 'KR', value: 'kr' },
            )
        )
        .addStringOption(option => option
            .setName('player').setNameLocalizations({
                'es-ES': 'jugador',
            })
            .setDescription('League of Legends username').setDescriptionLocalizations({
                'es-ES': 'Nombre de usuario de League of Legends',
            })
            .setRequired(false)
        )
        .addUserOption(option => option
            .setName('mention').setNameLocalizations({
                'es-ES': 'mención',
            })
            .setDescription('Discord user').setDescriptionLocalizations({
                'es-ES': 'Usuario de Discord',
            })
            .setRequired(false)
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        var identifiers = await get_user(interaction);
        if (typeof identifiers == 'string') return error(interaction, locale, identifiers);
    
        var summoner = await new Summoner().get_summoner(identifiers.region, identifiers.puuid);
        const last_games = await new LastGames().get_last_games(identifiers.region, identifiers.puuid);

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.history_command.embed)
            .replace('{{name}}', summoner.name)
            .replace('{{iconURL}}', summoner.icon.url)
            .replace('{{winrate}}', last_games.winrate)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTimestamp();

        for (var i = 0; i < last_games.matches.length; i++) {
            var match = last_games.matches[i];
            var wintext = typeof match.stats.win === 'boolean' ? match.stats.win ? locale.win.win : locale.win.loss : locale.win.remake;
            embed.addFields({
                name: locale.history_command.fields[0].name
                    .replace('{{win}}', wintext)
                    .replace('{{emote}}', match.champion.emote)
                    .replace('{{champion}}', match.champion.name)
                    .replace('{{map}}', locale.maps[match.map])
                    .replace('{{queue}}', locale.queues[match.queue]),
                value: locale.history_command.fields[0].value
                    .replace('{{duration}}', `${Math.floor(match.time.duration / 60)}:${match.time.duration % 60 < 10 ? '0' + match.time.duration % 60 : match.time.duration % 60}`)
                    .replace('{{kills}}', match.stats.kills)
                    .replace('{{deaths}}', match.stats.deaths)
                    .replace('{{assists}}', match.stats.assists)
                    .replace('{{cs}}', match.stats.cs)
                    .replace('{{cs_emote}}', get_emote('cs'))
                    .replace('{{cspm}}', match.stats.cspm)
                    .replace('{{region}}', identifiers.region.name.toLowerCase())
                    .replace('{{game_id}}', match.game_id.split('_')[1])
            });
        }
        return await interaction.followUp({ embeds: [embed] });
    }
}
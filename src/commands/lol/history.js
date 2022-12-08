const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const get_summoner = require('../../util/functions/league/get_summoner');
const get_emote = require('../../util/functions/league/get_emote');
const LastGames = require('../../util/classes/league/last_games');
const error = require('../../util/functions/error');

async function execute(interaction) {
    var summoner = await get_summoner(interaction);
    if (typeof summoner == 'string') return error(interaction, summoner);
    const last_games = await new LastGames().get_last_games(summoner.region, summoner.data.identifiers.puuid);

    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.history_command.embed)
        .replace('{{name}}', summoner.data.name)
        .replace('{{iconURL}}', summoner.data.icon.url)
        .replace('{{winrate}}', last_games.winrate)
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).setTimestamp();

    for (var i = 0; i < last_games.matches.length; i++) {
        var match = last_games.matches[i];
        var wintext = typeof match.stats.win === 'boolean' ? match.stats.win ? interaction.locale.win.win : interaction.locale.win.loss : interaction.locale.win.remake;
        embed.addFields({
            name: interaction.locale.history_command.fields[0].name
                .replace('{{win}}', wintext)
                .replace('{{emote}}', match.champion.emote)
                .replace('{{champion}}', match.champion.name)
                .replace('{{map}}', interaction.locale.maps[match.map])
                .replace('{{queue}}', interaction.locale.queues[match.queue]),
            value: interaction.locale.history_command.fields[0].value
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

const data = new SlashCommandSubcommandBuilder()
    .setName('history')
    .setNameLocalizations({
        'es-ES': 'historial',
    })
    .setDescription('Shows the 10 last games of a player')
    .setDescriptionLocalizations({
        'es-ES': 'Muestra las 10 últimas partidas de un jugador',
    })
    .addStringOption(option => {
        return option
            .setName('region')
            .setNameLocalizations({
                'es-ES': 'región'
            })
            .setDescription('Player region')
            .setDescriptionLocalizations({
                'es-ES': 'Región del jugador'
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
            );
    })
    .addStringOption(option => {
        return option
            .setName('name')
            .setNameLocalizations({
                'es-ES': 'nombre'
            })
            .setDescription('League of Legends summoner name')
            .setDescriptionLocalizations({
                'es-ES': 'Nombre de invocador de League of Legends'
            })
            .setRequired(false);
    })
    .addUserOption(option => {
        return option
            .setName('user')
            .setNameLocalizations({
                'es-ES': 'usuario'
            })
            .setDescription('Discord user')
            .setDescriptionLocalizations({
                'es-ES': 'Usuario de Discord'
            })
            .setRequired(false);
    });

module.exports = { data, execute };
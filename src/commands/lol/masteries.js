const { SlashCommandSubcommandBuilder, EmbedBuilder, TimestampStyles, time } = require('discord.js');
const get_summoner = require('../../util/functions/league/get_summoner');
const get_emote = require('../../util/functions/league/get_emote');
const Masteries = require('../../util/classes/league/masteries');
const error = require('../../util/functions/error');

async function execute(interaction) {
    var summoner = await get_summoner(interaction);
    if (typeof summoner == 'string') return error(interaction, summoner);

    var masteries = await new Masteries().get_masteries(summoner.region, summoner.data.identifiers.s_id);
    if (!masteries.champions[0].champion_level) return error(interaction, 'no-masteries');

    var champs_row = '';
    for (var i = 0; i < 10 && masteries.champions[i].champion.id; i++) {
        var champ = masteries.champions[i];
        var cdata = champ.champion;
        champs_row += interaction.locale.masteries_command.rows.champions
            .replace('{{emote}}', cdata.emote)
            .replace('{{level}}', champ.champion_level)
            .replace('{{champion}}', cdata.name)
            .replace('{{points}}', champ.champion_points.toLocaleString(interaction.lang));
        champs_row += '\n';
    }

    var lastplay_row = '';
    for (var i = 0; i < 10 && masteries.champions[i].champion.id; i++) {
        var entry = masteries.champions[i];
        lastplay_row += `${time(new Date(entry.last_play_time), TimestampStyles.RelativeTime)}\n`;
    }

    var chest_tokens_row = '';
    for (var i = 0; i < 10 && masteries.champions[i].champion.id; i++) {
        var entry = masteries.champions[i];
        var chest = entry.chest_granted ? get_emote('Chest') : get_emote('NoChest');
        var tokens = entry.champion_level == 7 ? interaction.locale.masteries_command.rows.mastered : entry.tokens_earned == 1 ? `1 token` : `${entry.tokens_earned} tokens`;
        chest_tokens_row += `${chest} - ${tokens}\n`;
    }

    var footer = interaction.locale.masteries_command.rows.footer
        .replace('{{champions}}', masteries.champs_played)
        .replace('{{levels}}', masteries.total_lvls)
        .replace('{{points}}', masteries.total_pts.toLocaleString(interaction.lang))
        .replace('{{chests}}', masteries.chests_earned)
        .replace('{{champions}}', masteries.champs_played);
    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.masteries_command.embed)
        .replace('{{name}}', summoner.data.name)
        .replace('{{iconURL}}', summoner.data.icon.url)
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).addFields(
        { name: interaction.locale.masteries_command.fields[0].name, value: champs_row, inline: true },
        { name: interaction.locale.masteries_command.fields[1].name, value: lastplay_row, inline: true },
        { name: interaction.locale.masteries_command.fields[2].name, value: chest_tokens_row, inline: true },
        { name: '\u200B', value: footer, inline: false }
    ).setTimestamp();

    return interaction.followUp({ embeds: [embed] });
}

const data = new SlashCommandSubcommandBuilder()
    .setName('masteries')
    .setNameLocalizations({
        'es-ES': 'maestrías',
    })
    .setDescription('Shows a player masteries')
    .setDescriptionLocalizations({
        'es-ES': 'Muestra las maestrías de un jugador',
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
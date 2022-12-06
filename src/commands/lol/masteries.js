const { SlashCommandSubcommandBuilder, EmbedBuilder, TimestampStyles, time } = require('discord.js');
const get_emote = require('../../util/league/functions/get_emote');
const get_user = require('../../util/league/functions/get_user');
const Masteries = require('../../util/league/classes/masteries');
const Summoner = require('../../util/league/classes/summoner');
const error = require('../../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers'
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('masteries').setNameLocalization('es-ES', 'maestrías')
        .setDescription('Shows the masteries of a player')
        .setDescriptionLocalization('es-ES', 'Muestra las maestrías de un jugador')
        .addStringOption(option => option
            .setName('region').setNameLocalization('es-ES', 'región')
            .setDescription('Player region').setDescriptionLocalization('es-ES', 'Región del jugador')
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
            .setName('player').setNameLocalization('es-ES', 'jugador')
            .setDescription('League of Legends username').setDescriptionLocalization('es-ES', 'Nombre de usuario de League of Legends')
            .setRequired(false))
        .addUserOption(option => option
            .setName('mention').setNameLocalization('es-ES', 'mención')
            .setDescription('Discord user').setDescriptionLocalization('es-ES', 'Usuario de Discord')
            .setRequired(false)
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        var identifiers = await get_user(interaction);
        if (typeof identifiers == 'string') return error(interaction, locale, identifiers);
    
        var summoner = await new Summoner().get_summoner(identifiers.region, identifiers.puuid);
    
        var masteries = await new Masteries().get_masteries(identifiers.region, summoner.identifiers.s_id);
        if (!masteries.champions[0].champion_level) return error(interaction, locale, 'no-masteries');

        var champs_row = '';
        for (var i = 0; i < 10 && masteries.champions[i].champion.id; i++) {
            var champ = masteries.champions[i];
            var cdata = champ.champion;
            champs_row += locale.masteries_command.rows.champions
                .replace('{{emote}}', cdata.emote)
                .replace('{{level}}', champ.champion_level)
                .replace('{{champion}}', cdata.name)
                .replace('{{points}}', champ.champion_points.toLocaleString(lang));
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
            var tokens = entry.champion_level == 7 ? locale.masteries_command.rows.mastered : entry.tokens_earned == 1 ? `1 token` : `${entry.tokens_earned} tokens`;
            chest_tokens_row += `${chest} - ${tokens}\n`;
        }

        var footer = locale.masteries_command.rows.footer
            .replace('{{champions}}', masteries.champs_played)
            .replace('{{levels}}', masteries.total_lvls)
            .replace('{{points}}', masteries.total_pts.toLocaleString(lang))
            .replace('{{chests}}', masteries.chests_earned)
            .replace('{{champions}}', masteries.champs_played);
        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.masteries_command.embed)
            .replace('{{name}}', summoner.name)
            .replace('{{iconURL}}', summoner.icon.url)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).addFields(
            { name: locale.masteries_command.fields[0].name, value: champs_row, inline: true },
            { name: locale.masteries_command.fields[1].name, value: lastplay_row, inline: true },
            { name: locale.masteries_command.fields[2].name, value: chest_tokens_row, inline: true },
            { name: '\u200B', value: footer, inline: false }
        ).setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    }
}
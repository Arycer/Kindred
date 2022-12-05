const { SlashCommandSubcommandBuilder, EmbedBuilder, TimestampStyles, time } = require('discord.js');
const get_emote = require('../../util/league/functions/get_emote');
const get_user = require('../../util/league/functions/get_user');
const Masteries = require('../../util/league/classes/masteries');
const Summoner = require('../../util/league/classes/summoner');
const Region = require('../../util/league/classes/region');
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

        if (identifiers == null) {
            if (interaction.options.getUser('mención') || interaction.options.getUser('mention')) {
                var localized_error = locale.error_messages['no-linked-member'];
                var localized_embed = locale.error_embed;
                var embed = new EmbedBuilder()
                    .setThumbnail(localized_embed.thumbnail)
                    .setAuthor(localized_embed.author)
                    .setTitle(localized_embed.title)
                    .setDescription(localized_error)
                    .setColor(localized_embed.color)
                    .setFooter({ text: localized_embed.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
                    .setTimestamp();
                return interaction.followUp({ embeds: [embed] });
            } else {
                var localized_error = locale.error_messages['no-linked-account'];
                var localized_embed = locale.error_embed;
                var embed = new EmbedBuilder()
                    .setThumbnail(localized_embed.thumbnail)
                    .setAuthor(localized_embed.author)
                    .setTitle(localized_embed.title)
                    .setDescription(localized_error)
                    .setColor(localized_embed.color)
                    .setFooter({ text: localized_embed.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
                    .setTimestamp();
                return interaction.followUp({ embeds: [embed] });
            }
        }
    
        var region = new Region().get_region(identifiers.region);
        var summoner = await new Summoner().get_summoner(region, identifiers.id);
        if (!summoner.identifiers.s_id) {
            var localized_error = locale.error_messages['profile-not-found'];
            var localized_embed = locale.error_embed;
            var embed = new EmbedBuilder()
                .setThumbnail(localized_embed.thumbnail)
                .setAuthor(localized_embed.author)
                .setTitle(localized_embed.title)
                .setDescription(localized_error)
                .setColor(localized_embed.color)
                .setFooter({ text: localized_embed.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
                .setTimestamp();
            return interaction.followUp({ embeds: [embed] });
        }
    
        var masteries = await new Masteries().get_masteries(region, summoner.identifiers.s_id);
        if (!masteries.champions[0].champion_level) {
            var localized_error = locale.error_messages['no-masteries'];
            var localized_embed = locale.error_embed;
            var embed = new EmbedBuilder()
                .setThumbnail(localized_embed.thumbnail)
                .setAuthor(localized_embed.author)
                .setTitle(localized_embed.title)
                .setDescription(localized_error)
                .setColor(localized_embed.color)
                .setFooter({ text: localized_embed.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
                .setTimestamp();
            return interaction.followUp({ embeds: [embed] });
        }

        var localized_data = locale.masteries_command;

        var champs_row = '';
        for (var i = 0; i < 10 && masteries.champions[i].champion.id; i++) {
            var champ = masteries.champions[i];
            var cdata = champ.champion;
            champs_row += localized_data.rows.champions
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
            var tokens = entry.champion_level == 7 ? localized_data.rows.mastered : entry.tokens_earned == 1 ? `1 token` : `${entry.tokens_earned} tokens`;
            chest_tokens_row += `${chest} - ${tokens}\n`;
        }

        var embed = new EmbedBuilder()
            .setAuthor({
                name: localized_data.embed.author.name.replace('{{name}}', summoner.name),
                iconURL: summoner.icon.url
            })
            .setTitle(localized_data.embed.title)
            .addFields(
                { name: localized_data.embed.fields[0].name, value: champs_row, inline: true },
                { name: localized_data.embed.fields[1].name, value: lastplay_row, inline: true },
                { name: localized_data.embed.fields[2].name, value: chest_tokens_row, inline: true },
                { name: '\u200B', value: localized_data.rows.footer
                    .replace('{{champions}}', masteries.champs_played)
                    .replace('{{levels}}', masteries.total_lvls)
                    .replace('{{points}}', masteries.total_pts.toLocaleString(lang))
                    .replace('{{chests}}', masteries.chests_earned)
                    .replace('{{champions}}', masteries.champs_played)
                }
            )
            .setColor(localized_data.embed.color)
            .setFooter({ text: localized_data.embed.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
            .setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    }
}
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const get_emote = require('../../util/league/functions/get_emote');
const LastGames = require('../../util/league/classes/last_games');
const get_user = require('../../util/league/functions/get_user');
const Summoner = require('../../util/league/classes/summoner');
const Region = require('../../util/league/classes/region');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('history').setNameLocalization('es-ES', 'historial')
        .setDescription('Shows the last games of a player')
        .setDescriptionLocalization('es-ES', 'Muestra las últimas 10 partidas de un jugador')
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
            .setRequired(false)
        )
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
        
            const server = new Region().get_region(identifiers.region);
            const summoner = await new Summoner().get_summoner(server, identifiers.id)
            
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
        
            const last_games = await new LastGames().get_last_games(server, summoner.identifiers.puuid);
            var localized_data = locale.history_command;

            var embed = new EmbedBuilder()
                .setAuthor({
                    name: localized_data.embed.author.name
                        .replace('{{name}}', summoner.name)
                        .replace('{{winrate}}', last_games.winrate),
                    iconURL: summoner.icon.url
                })
                .setColor(localized_data.embed.color)
                .setFooter({
                    text: localized_data.embed.footer.text
                        .replace('{{requester}}', interaction.user.tag),
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();

            for (var i = 0; i < last_games.matches.length; i++) {
                var match = last_games.matches[i];
                var wintext = typeof match.stats.win === 'boolean' ? match.stats.win ? locale.win.win : locale.win.loss : locale.win.remake;
                embed.addFields({
                    name: localized_data.fields[0].name
                        .replace('{{win}}', wintext)
                        .replace('{{emote}}', match.champion.emote)
                        .replace('{{champion}}', match.champion.name)
                        .replace('{{map}}', locale.maps[match.map])
                        .replace('{{queue}}', locale.queues[match.queue]),
                    value: localized_data.fields[0].value
                        .replace('{{duration}}', `${Math.floor(match.time.duration / 60)}:${match.time.duration % 60 < 10 ? '0' + match.time.duration % 60 : match.time.duration % 60}`)
                        .replace('{{kills}}', match.stats.kills)
                        .replace('{{deaths}}', match.stats.deaths)
                        .replace('{{assists}}', match.stats.assists)
                        .replace('{{cs}}', match.stats.cs)
                        .replace('{{cs_emote}}', get_emote('cs'))
                        .replace('{{cspm}}', match.stats.cspm)
                        .replace('{{region}}', server.name.toLowerCase())
                        .replace('{{game_id}}', match.game_id.split('_')[1])
                });
            }
            return await interaction.followUp({ embeds: [embed] });
        }
}
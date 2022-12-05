const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const get_user = require('../../util/league/functions/get_user');
const Summoner = require('../../util/league/classes/summoner');
const LiveGame = require('../../util/league/classes/livegame');
const Region = require('../../util/league/classes/region');
const error = require('../../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers'
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('live')
        .setDescription('Shows the live game of a summoner').setDescriptionLocalization('es-ES', 'Muestra la partida en vivo de un invocador')
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
                .setName('metion').setNameLocalization('es-ES', 'mención')
                .setDescription('Discord user').setDescriptionLocalization('es-ES', 'Usuario de Discord')
                .setRequired(false)),
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
    
        var livegame = new LiveGame();
        await livegame.get_livegame(region, summoner.identifiers.s_id);
    
        if (!livegame.ingame) {
            var localized_error = locale.error_messages['not-in-game'];
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

        var localized_data = locale.live_command;
        var embed = new EmbedBuilder()
            .setAuthor({
                name: localized_data.embed.author.name
                    .replace('{{region}}', region.name)
                    .replace('{{name}}', summoner.name),
                iconURL: summoner.icon.url
            })
            .setTitle(localized_data.embed.title.replace('{{map}}', locale.maps[livegame.map]).replace('{{queue}}', locale.queues[livegame.queue]))
            .setFooter({
                text: localized_data.embed.footer.text
                    .replace('{{requester}}', interaction.user.tag),
                iconURL: interaction.user.avatarURL()
            })
            .setColor(localized_data.embed.color)
            .setTimestamp();

        var blue = livegame.participants.blue;
        for (var i = 0; i < blue.length; i++) {
            var participant = blue[i];
            if (participant.ranked.solo.tier || participant.ranked.flex.tier) {
                var rank = participant.ranked.solo.tier ? locale.ranks[participant.ranked.solo.tier] : locale.ranks[participant.ranked.flex.tier];
                var emote = participant.ranked.solo.tier ? participant.ranked.solo.emote : participant.ranked.flex.emote;
                var division = participant.ranked.solo.tier ? participant.ranked.solo.rank : participant.ranked.flex.rank;
                var lp = participant.ranked.solo.tier ? participant.ranked.solo.lps : participant.ranked.flex.lps;
                var wins = participant.ranked.solo.tier ? participant.ranked.solo.wins : participant.ranked.flex.wins;
                var losses = participant.ranked.solo.tier ? participant.ranked.solo.losses : participant.ranked.flex.losses;
                var winrate = participant.ranked.solo.tier ? participant.ranked.solo.winrate : participant.ranked.flex.winrate;
                var queue = participant.ranked.solo.tier ? locale.queues[420] : locale.queues[440];
                var r_text = `${queue} · ${emote} ${rank} · ${division} ${lp} LP · ${wins}W ${losses}L (${winrate}%)`;
            } else {
                var r_text = locale.ranks['unranked'];
            }
            embed.addFields({
                name: localized_data.fields[0].name
                    .replace('{{team}}', '🔹')
                    .replace('{{index}}', i + 1)
                    .replace('{{name}}', participant.summoner_data.name)
                    .replace('{{emote}}', participant.champion.emote)
                    .replace('{{champion}}', participant.champion.name)
                    .replace('{{spell1}}', participant.spells.spell1.emote)
                    .replace('{{spell2}}', participant.spells.spell2.emote)
                    .replace('{{rune1}}', participant.runes.primary.emote)
                    .replace('{{rune2}}', participant.runes.secondary.emote),
                value: r_text,
                inline: false
            });
        }

        var red = livegame.participants.red;
        for (var i = 0; i < red.length; i++) {
            var participant = red[i];
            if (participant.ranked.solo.tier || participant.ranked.flex.tier) {
                var rank = participant.ranked.solo.tier ? locale.ranks[participant.ranked.solo.tier] : locale.ranks[participant.ranked.flex.tier];
                var emote = participant.ranked.solo.tier ? participant.ranked.solo.emote : participant.ranked.flex.emote;
                var division = participant.ranked.solo.tier ? participant.ranked.solo.rank : participant.ranked.flex.rank;
                var lp = participant.ranked.solo.tier ? participant.ranked.solo.lps : participant.ranked.flex.lps;
                var wins = participant.ranked.solo.tier ? participant.ranked.solo.wins : participant.ranked.flex.wins;
                var losses = participant.ranked.solo.tier ? participant.ranked.solo.losses : participant.ranked.flex.losses;
                var winrate = participant.ranked.solo.tier ? participant.ranked.solo.winrate : participant.ranked.flex.winrate;
                var queue = participant.ranked.solo.tier ? locale.queues[420] : locale.queues[440];
                var r_text = `${queue} · ${emote} ${rank} · ${division} ${lp} LP · ${wins}W ${losses}L (${winrate}%)`;
            } else {
                var r_text = locale.ranks['unranked'];
            }
            embed.addFields({
                name: localized_data.fields[0].name
                    .replace('{{team}}', '🔸')
                    .replace('{{index}}', i + 1)
                    .replace('{{name}}', participant.summoner_data.name)
                    .replace('{{emote}}', participant.champion.emote)
                    .replace('{{champion}}', participant.champion.name)
                    .replace('{{spell1}}', participant.spells.spell1.emote)
                    .replace('{{spell2}}', participant.spells.spell2.emote)
                    .replace('{{rune1}}', participant.runes.primary.emote)
                    .replace('{{rune2}}', participant.runes.secondary.emote),
                value: r_text,
                inline: false
            });
        }

        return interaction.followUp({ embeds: [embed] });
    }
}
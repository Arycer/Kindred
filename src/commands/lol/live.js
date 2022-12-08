const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const get_summoner = require('../../util/functions/league/get_summoner');
const LiveGame = require('../../util/classes/league/livegame');
const error = require('../../util/functions/error');

async function execute(interaction) {
    var summoner = await get_summoner(interaction);
    if (typeof summoner == 'string') return error(interaction, summoner);
    
    var livegame = new LiveGame();
    await livegame.get_livegame(summoner.region, summoner.data.identifiers.s_id);

    if (!livegame.ingame) return error(interaction, 'not-in-game');

    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.live_command.embed)
        .replace('{{region}}', summoner.region.name)
        .replace('{{name}}', summoner.data.name)
        .replace('{{iconURL}}', summoner.data.icon.url)
        .replace('{{map}}', interaction.locale.maps[livegame.map])
        .replace('{{queue}}', interaction.locale.queues[livegame.queue])
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).setTimestamp();

    var blue = livegame.participants.blue;
    for (var i = 0; i < blue.length; i++) {
        var participant = blue[i];
        if (participant.ranked.solo.tier || participant.ranked.flex.tier) {
            var rank = participant.ranked.solo.tier ? interaction.locale.ranks[participant.ranked.solo.tier] : interaction.locale.ranks[participant.ranked.flex.tier];
            var emote = participant.ranked.solo.tier ? participant.ranked.solo.emote : participant.ranked.flex.emote;
            var division = participant.ranked.solo.tier ? participant.ranked.solo.rank : participant.ranked.flex.rank;
            var lp = participant.ranked.solo.tier ? participant.ranked.solo.lps : participant.ranked.flex.lps;
            var wins = participant.ranked.solo.tier ? participant.ranked.solo.wins : participant.ranked.flex.wins;
            var losses = participant.ranked.solo.tier ? participant.ranked.solo.losses : participant.ranked.flex.losses;
            var winrate = participant.ranked.solo.tier ? participant.ranked.solo.winrate : participant.ranked.flex.winrate;
            var queue = participant.ranked.solo.tier ? interaction.locale.queues[420] : interaction.locale.queues[440];
            var r_text = `${queue} · ${emote} ${rank} · ${division} ${lp} LP · ${wins}W ${losses}L (${winrate}%)`;
        } else {
            var r_text = interaction.locale.ranks['unranked'];
        }
        embed.addFields({
            name: interaction.locale.live_command.fields[0].name
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
            var rank = participant.ranked.solo.tier ? interaction.locale.ranks[participant.ranked.solo.tier] : interaction.locale.ranks[participant.ranked.flex.tier];
            var emote = participant.ranked.solo.tier ? participant.ranked.solo.emote : participant.ranked.flex.emote;
            var division = participant.ranked.solo.tier ? participant.ranked.solo.rank : participant.ranked.flex.rank;
            var lp = participant.ranked.solo.tier ? participant.ranked.solo.lps : participant.ranked.flex.lps;
            var wins = participant.ranked.solo.tier ? participant.ranked.solo.wins : participant.ranked.flex.wins;
            var losses = participant.ranked.solo.tier ? participant.ranked.solo.losses : participant.ranked.flex.losses;
            var winrate = participant.ranked.solo.tier ? participant.ranked.solo.winrate : participant.ranked.flex.winrate;
            var queue = participant.ranked.solo.tier ? interaction.locale.queues[420] : interaction.locale.queues[440];
            var r_text = `${queue} · ${emote} ${rank} · ${division} ${lp} LP · ${wins}W ${losses}L (${winrate}%)`;
        } else {
            var r_text = interaction.locale.ranks['unranked'];
        }
        embed.addFields({
            name: interaction.locale.live_command.fields[0].name
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

const data = new SlashCommandSubcommandBuilder()
    .setName('live')
    .setNameLocalizations({
        'es-ES': 'live',
    })
    .setDescription('Show the live game of a player')
    .setDescriptionLocalizations({
        'es-ES': 'Muestra la partida en vivo de un jugador'
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
const { EmbedBuilder, TimestampStyles, time } = require('discord.js');
const get_emote = require('../../../league/functions/get_emote');
const Masteries = require('../../../league/classes/masteries');
const Summoner = require('../../../league/classes/summoner');
const Region = require('../../../league/classes/region');
const error = require('../../../util/error');
const MeowDB = require('meowdb');


async function execute(interaction) {
    var username = interaction.options.getString('jugador') || interaction.options.getString('player');
    var region = interaction.options.getString('region') || interaction.options.getString('región');
    var mención = interaction.options.getUser('mención') || interaction.options.getUser('mention');

    var db = new MeowDB({
        dir: './src/database',
        name: 'accounts'
    });

    if (!username || !region) {
        if (mención) {
            var acc = db.get(mención.id);
            if (!acc) return interaction.followUp({ embeds: [error('es-ES', 'no-linked-member', interaction.user.tag)] });
            var puuid = acc.summoner.identifiers.puuid;
            region = acc.region.id;

        } else {
            var acc = db.get(interaction.user.id);
            if (!acc) return interaction.followUp({ embeds: [error('es-ES', 'no-linked-account', interaction.user.tag)] });
            var puuid = acc.summoner.identifiers.puuid;
            region = acc.region.id;
        }
    }

    var region = new Region().get_region(region);
    
    var summoner = await new Summoner().get_summoner(region, puuid ? puuid : username);
    if (!summoner.identifiers.s_id) return interaction.followUp({ embeds: [error('es-ES', 'profile-not-found', interaction.user.tag)] });

    var masteries = await new Masteries().get_masteries(region, summoner.identifiers.s_id);
    if (!masteries.champions[0].champion_level) return interaction.followUp({ embeds: [error('es-ES', 'no-mastery', interaction.user.tag)] });

    var champs_row = '';
    for (var i = 0; i < 10 && masteries.champions[i].champion.id; i++) {
        var champ = masteries.champions[i];
        var cdata = champ.champion;
        champs_row += `${cdata.emote} **[${champ.champion_level}]** ${cdata.name} - ${champ.champion_points.toLocaleString('es-ES')} puntos\n`;
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
        var tokens = entry.champion_level == 7 ? 'Masterizado' : entry.tokens_earned == 1 ? `1 token` : `${entry.tokens_earned} tokens`;
        chest_tokens_row += `${chest} - ${tokens}\n`;
    }

    var embed = new EmbedBuilder()
        .setAuthor({ name: `Maestrías de ${summoner.name}`, iconURL: summoner.icon.url })
        .setTitle('Esto es lo que he encontrado:')
        .setColor('#5d799d')
        .addFields(
            { name: 'Campeones', value: champs_row, inline: true },
            { name: 'Última vez', value: lastplay_row, inline: true },
            { name: 'Masterización', value: chest_tokens_row, inline: true },
            { name: '\u200B', value: `**Campeones:** ${masteries.champs_played} · **Niveles:** ${masteries.total_lvls} · **Puntos de maestría:** ${masteries.total_pts.toLocaleString('es-ES')} · **Cofres:** ${masteries.chests_earned}/${masteries.champs_played}` },
        )
        .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
        .setTimestamp()

    return interaction.followUp({ embeds: [embed] });
}

module.exports = execute;
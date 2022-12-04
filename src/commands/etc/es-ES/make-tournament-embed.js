const get_map_name = require('../../../league/functions/get_map_name');
const { EmbedBuilder, time, TimestampStyles } = require('discord.js');
const get_emote = require('../../../league/functions/get_emote');

async function make_embed (callback) {
    console.log(callback);
    const embed = new EmbedBuilder()
        .setAuthor({ name: '¡La partida ha terminado!', iconURL: 'https://i.imgur.com/hGG9kLU.png' })
        .setTitle(callback.title)
        .setDescription(`Mapa: ${await get_map_name(callback.map, 'es-ES')} - ${time(new Date(callback.timestamp), TimestampStyles.ShortDateTime)}`)
        .setColor('#5d779d')
        .setFooter({ text: `¡Añádeme a tu servidor! - bit.ly/3F4vQ9v` })
        .setTimestamp();

    for (var i = 0; i < callback.participants.winningTeam.length; i++) {
        var p = callback.participants.winningTeam[i]; 
        var champ = p.match.champion;
        var summoner = p.summoner;
        var match = p.match;

        var items = '';

        for (var j = 0; j < match.inventory.items.length; j++) {
            var item = match.inventory.items[j];
            items += item.emote;
        }

        var e_cs = get_emote('minioncount');
        embed.addFields({
            name: `🟢 ${summoner.name} - KDA: ${match.stats.kills}/${match.stats.deaths}/${match.stats.assists} - ${match.stats.cs} ${e_cs}(${match.stats.cs_per_min}/min)`,
            value: `${champ.emote} ${champ.name} - ${match.spells.spell1.emote} ${match.spells.spell2.emote} ${match.inventory.trinket.emote} ${items}`,
        });
    }

    for (var i = 0; i < callback.participants.losingTeam.length; i++) {
        var p = callback.participants.losingTeam[i];
        var champ = p.match.champion;
        var summoner = p.summoner;
        var match = p.match;

        var items = '';

        for (var j = 0; j < match.inventory.items.length; j++) {
            var item = match.inventory.items[j];
            items += item.emote;
        }

        var e_cs = get_emote('minioncount');
        embed.addFields({
            name: `🔴 ${summoner.name} - KDA: ${match.stats.kills}/${match.stats.deaths}/${match.stats.assists} - ${match.stats.cs} ${e_cs} (${match.stats.cs_per_min}/min)`,
            value: `${champ.emote} ${champ.name} - ${match.spells.spell1.emote} ${match.spells.spell2.emote} ${match.inventory.trinket.emote} ${items}`,
        });
    }
    return embed;
}

module.exports = make_embed;
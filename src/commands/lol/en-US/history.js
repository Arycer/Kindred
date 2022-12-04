const get_queue_name = require('../../../league/functions/get_queue_name');
const get_map_name = require('../../../league/functions/get_map_name');
const get_emote = require('../../../league/functions/get_emote');
const LastGames = require('../../../league/classes/last_games');
const Summoner = require('../../../league/classes/summoner');
const Region = require('../../../league/classes/region');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');
const MeowDB = require('meowdb');

async function execute(interaction) {
    var username = interaction.options.getString('jugador') || interaction.options.getString('player');
    var region = interaction.options.getString('región') || interaction.options.getString('region');
    var mención = interaction.options.getUser('mención') || interaction.options.getUser('mention');

    var db = new MeowDB({
        dir: './src/database',
        name: 'accounts'
    });

    if (!username || !region) {
        if (mención) {
            var acc = db.get(mención.id);
            if (!acc) return interaction.followUp({ embeds: [error('en-US', 'no-linked-member', interaction.user.tag)] });
            var puuid = acc.summoner.identifiers.puuid;
            region = acc.region.id;
        } else {
            var acc = db.get(interaction.user.id);
            if (!acc) return interaction.followUp({ embeds: [error('en-US', 'no-linked-account', interaction.user.tag)] });
            var puuid = acc.summoner.identifiers.puuid;
            region = acc.region.id;
        }
    }

    const summoner = new Summoner();
    const server = new Region().get_region(region);
    await summoner.get_summoner(server, puuid ? puuid : username);
    
    if (!summoner.identifiers.s_id) return interaction.followUp({ embeds: [error('en-US', 'profile-not-found', interaction.user.tag)] });

    const last_games = new LastGames();
    await last_games.get_last_games(server, summoner.identifiers.puuid);

    var embed = new EmbedBuilder()
        .setAuthor({ name: `Last 10 games of ${summoner.name} - ${last_games.winrate}% WR`, iconURL: summoner.icon.url })
        .setColor('#5d779d')
        .setFooter({ text: `Requested by ${interaction.user.username}`})
        .setTimestamp();

    for (var i = 0; i < last_games.matches.length; i++) {
        var game = last_games.matches[i];
        var champ = `${game.champion.emote} ${game.champion.name}`;
        var win = game.stats.win;
        var kills = game.stats.kills;
        var deaths = game.stats.deaths;
        var assists = game.stats.assists;
        var cs = game.stats.cs;
        var cs_per_min = game.stats.cs_per_min;
        var cs_e = get_emote('minioncount');

        var duration = `${Math.floor(game.time.duration / 60)}:${game.time.duration % 60 < 10 ? '0' + game.time.duration % 60 : game.time.duration % 60}`;
        var wintext = typeof win === 'boolean' ? win ? `🟢 **Victory**` : `🔴 **Defeat**` : `⚙️ **Remake**`;
        var url = `https://www.leagueofgraphs.com/es/match/${server.name.toLowerCase()}/${game.game_id.split('_')[1]}`;

        embed.addFields({
            name: `${wintext} - ${champ} - ${await get_map_name(game.map, 'en-US')} - ${await get_queue_name(game.queue, 'en-US')}`,
            value: `🕐 Duration: ${duration} | KDA: ${kills}/${deaths}/${assists} | CS: ${cs} ${cs_e} (${cs_per_min}/min) | [🔗 More](${url})`,
        })
    }
    return await interaction.followUp({ embeds: [embed] });
}

module.exports = execute;
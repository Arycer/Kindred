const get_queue_name = require('../../../league/functions/get_queue_name');
const get_map_name = require('../../../league/functions/get_map_name');
const { EmbedBuilder, time, TimestampStyles } = require('discord.js');
const get_emote = require('../../../league/functions/get_emote');
const Profile = require('../../../league/classes/profile');
const error = require('../../../util/error');
const MeowDB = require('meowdb');

var db = new MeowDB({
    dir: './src/database',
    name: 'accounts'
});

async function execute(interaction) {
    var username = interaction.options.getString('jugador') || interaction.options.getString('player');
    var region = interaction.options.getString('region') || interaction.options.getString('región');
    var mención = interaction.options.getUser('mención') || interaction.options.getUser('mention');

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

    const profile = new Profile();
    await profile.init(region, puuid ? puuid : username, interaction);

    if (!profile.summoner_data.name) return interaction.followUp({ embeds: [error('en-US', 'profile-not-found', interaction.user.tag)] });

    var m_text = '';
    for (var i = 0; i < 3; i++) {
        if (profile.masteries.champions[i].champion.name) {
            var entry = profile.masteries.champions[i];
            m_text += `${entry.champion.emote} **[${entry.champion_level}]** ${entry.champion.name} - ${entry.champion_points.toLocaleString('en-US')} points\n`;
        } else {
            m_text += `N/A.\n`;
            break;
        }
    }
    var r_text = ''; var r_name = '';
    if (profile.ranked.solo.tier) {
        var solo = profile.ranked.solo;
        r_name += `Solo/Duo stats`;
        r_text += `${solo.emote} ${solo.tier} ${solo.rank}\n`;
        r_text += `${solo.lps} League Points\n`;
        r_text += `${solo.wins}W - ${solo.losses}L (${solo.winrate}% WR)`;
    } else if (profile.ranked.flex.tier) {
        var flex = profile.ranked.flex;
        r_name += `Flex 5vs5 stats`;
        r_text += `${flex.emote} ${flex.tier} ${flex.rank}\n`;
        r_text += `${flex.lps} League Points\n`;
        r_text += `${flex.wins}W - ${flex.losses}L (${flex.winrate}% WR)`;
    } else {
        r_name += `Ranked stats`;
        r_text += `N/A.`;
    }

    var live_text = ''; var live_url = '';
    if (profile.livegame.ingame) {
        var live = profile.livegame;
        live_url = `https://porofessor.gg/es/live/${profile.region.name.toLowerCase()}/${profile.summoner_data.name.split(' ').join('%20')}`;
        live_text += `🟢 **Playing:** ${live.champion.emote} ${live.champion.name} - ${await get_map_name(live.map, 'en-US')} - ${await get_queue_name(live.queue, 'en-US')}}\n`;
        live_text += `🕐 **Elapsed time:** ${Math.floor(live.time.duration / 60)}:${live.time.duration % 60 < 10 ? '0' + live.time.duration % 60 : live.time.duration % 60}\n`;
        live_text += `📅 **Date:** ${time(new Date(live.time.start), TimestampStyles.ShortDateTime)} - 🔗 **More:** [Porofessor](${live_url})`;
    } else {
        live_text += `This player is not in a game.`;
    }

    var last_text = ''; var last_url = ''; var wintext = ''; var last_name = '';
    if (profile.lastgames.matches[0].game_id) {
        var last = profile.lastgames.matches[0];
        var cs_e = get_emote('minioncount');
        typeof last.stats.win === 'boolean' ? wintext = last.stats.win ? `🟢 **Victory**` : `🔴 **Defeat**` : wintext = `⚙️ **Remake**`;
        last_url = `https://www.leagueofgraphs.com/es/match/${profile.region.name.toLowerCase()}/${last.game_id.split('_')[1]}`;
        last_name = `Last game: ${await get_map_name(last.map, 'en-US')} - ${await get_queue_name(last.queue, 'en-US')}`;
        last_text += `${wintext} with ${last.champion.emote} ${last.champion.name} - ${last.stats.kills}/${last.stats.deaths}/${last.stats.assists} - `;
        last_text += `${last.stats.cs} ${cs_e} (${last.stats.cs_per_min} ${cs_e}/min)\n`;
        last_text += `🕐 **Game duration:** ${Math.floor(last.time.duration / 60)}:${last.time.duration % 60 < 10 ? '0' + last.time.duration % 60 : last.time.duration % 60}\n`;
        last_text += `📅 **Date:** ${time(new Date(last.time.start), TimestampStyles.ShortDateTime)} - 🔗 **More:** [League of Graphs](${last_url})`;
    } else {
        last_name = `Last game`;
        last_text += `N/A.`;
    }

    var leagueofgraphs = `https://www.leagueofgraphs.com/es/summoner/${profile.region.name.toLowerCase()}/${profile.summoner_data.name.split(' ').join('%20')}`;

    var embed = new EmbedBuilder()
        .setAuthor({ name: `[${profile.region.name}] ${profile.summoner_data.name}${mención ? ' - ' + mención.tag : username ? '' : ' - ' + interaction.user.tag }`, iconURL: profile.summoner_data.icon.url, url: leagueofgraphs })
        .setDescription(`**Here is what I found:**`)
        .addFields({ name: 'Level', value: `${profile.summoner_data.level}`, inline: true },
                    { name: 'Mastery points', value: `${profile.masteries.score} points in total`, inline: true },
                    { name: 'Last 10 games', value: `${profile.lastgames.winrate}% WR`, inline: true },
                    { name: 'Best champions', value: `${m_text}`, inline: true },
                    { name: `${r_name}`, value: `${r_text}`, inline: true },
                    { name: `Live game:`, value: `${live_text}`, inline: false },
                    { name: `${last_name}`, value: `${last_text}`, inline: false })
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setColor('#5d779d')
        .setTimestamp()
    
    interaction.followUp({ embeds: [embed] });
}

module.exports = execute;
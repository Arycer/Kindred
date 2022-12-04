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

    const profile = new Profile();
    await profile.init(region, puuid ? puuid : username, interaction);

    if (!profile.summoner_data.name) return interaction.followUp({ embeds: [error('es-ES', 'profile-not-found', interaction.user.tag)] });

    var m_text = '';
    for (var i = 0; i < 3; i++) {
        if (profile.masteries.champions[i].champion.name) {
            var entry = profile.masteries.champions[i];
            m_text += `${entry.champion.emote} **[${entry.champion_level}]** ${entry.champion.name} - ${entry.champion_points.toLocaleString('es-ES')} puntos\n`;
        } else {
            m_text += `No hay datos para mostrar.\n`;
            break;
        }
    }
    var r_text = ''; var r_name = '';
    if (profile.ranked.solo.tier) {
        var solo = profile.ranked.solo;
        r_name += `Estadísticas de Solo/Dúo`;
        r_text += `${solo.emote} ${solo.tier} ${solo.rank}\n`;
        r_text += `${solo.lps} Puntos de Liga\n`;
        r_text += `${solo.wins}V - ${solo.losses}D (${solo.winrate}% WR)`;
    } else if (profile.ranked.flex.tier) {
        var flex = profile.ranked.flex;
        r_name += `Estadísticas de Flex 5vs5`;
        r_text += `${flex.emote} ${flex.tier} ${flex.rank}\n`;
        r_text += `${flex.lps} Puntos de Liga\n`;
        r_text += `${flex.wins}V - ${flex.losses}D (${flex.winrate}% WR)`;
    } else {
        r_name += `Estadísticas de Ranked`;
        r_text += `No hay datos para mostrar.`;
    }

    var live_text = ''; var live_url = '';
    if (profile.livegame.ingame) {
        var live = profile.livegame;
        live_url = `https://porofessor.gg/es/live/${profile.region.name.toLowerCase()}/${profile.summoner_data.name.split(' ').join('%20')}`;
        live_text += `🟢 **Jugando:** ${live.champion.emote} ${live.champion.name} - ${await get_map_name(live.map, 'es-ES')} - ${await get_queue_name(live.queue, 'es-ES')}\n`;
        live_text += `🕐 **Tiempo transcurrido:** ${Math.floor(live.time.duration / 60)}:${live.time.duration % 60 < 10 ? '0' + live.time.duration % 60 : live.time.duration % 60}\n`;
        live_text += `📅 **Fecha:** ${time(new Date(live.time.start), TimestampStyles.ShortDateTime)} - 🔗 **Más:** [Porofessor](${live_url})`;
    } else {
        live_text += `Este jugador no está en partida en este momento.`;
    }

    var last_text = ''; var last_url = ''; var wintext = ''; var last_name = '';
    if (profile.lastgames.matches[0].game_id) {
        var last = profile.lastgames.matches[0];
        var cs_e = get_emote('minioncount');
        typeof last.stats.win === 'boolean' ? wintext = last.stats.win ? `🟢 **Victoria**` : `🔴 **Derrota**` : wintext = `⚙️ **Remake**`;
        last_url = `https://www.leagueofgraphs.com/es/match/${profile.region.name.toLowerCase()}/${last.game_id.split('_')[1]}`;
        last_name = `Última partida: ${await get_map_name(last.map, 'es-ES')} - ${await get_queue_name(last.queue, 'es-ES')}`;
        last_text += `${wintext} con ${last.champion.emote} ${last.champion.name} - ${last.stats.kills}/${last.stats.deaths}/${last.stats.assists} - `;
        last_text += `${last.stats.cs} ${cs_e} (${last.stats.cs_per_min} ${cs_e}/min)\n`;
        last_text += `🕐 **Duración de la partida:** ${Math.floor(last.time.duration / 60)}:${last.time.duration % 60 < 10 ? '0' + last.time.duration % 60 : last.time.duration % 60}\n`;
        last_text += `📅 **Fecha:** ${time(new Date(last.time.start), TimestampStyles.ShortDateTime)} - 🔗 **Más:** [League of Graphs](${last_url})`;
    } else {
        last_name = `Última partida:`;
        last_text += `No hay datos para mostrar.`;
    }

    var leagueofgraphs = `https://www.leagueofgraphs.com/es/summoner/${profile.region.name.toLowerCase()}/${profile.summoner_data.name.split(' ').join('%20')}`;

    var embed = new EmbedBuilder()
        .setAuthor({ name: `[${profile.region.name}] ${profile.summoner_data.name}${mención ? ' - ' + mención.tag : username ? '' : ' - ' + interaction.user.tag }`, iconURL: profile.summoner_data.icon.url, url: leagueofgraphs })
        .setDescription(`**Esto es lo que he encontrado:**`)
        .addFields({ name: 'Nivel', value: `${profile.summoner_data.level}`, inline: true },
                    { name: 'Puntuación de maestría', value: `${profile.masteries.score} puntos en total`, inline: true },
                    { name: 'Últimas 10 partidas', value: `${profile.lastgames.winrate}% WR`, inline: true },
                    { name: 'Mejores campeones', value: `${m_text}`, inline: true },
                    { name: `${r_name}`, value: `${r_text}`, inline: true },
                    { name: `Jugando ahora:`, value: `${live_text}`, inline: false },
                    { name: `${last_name}`, value: `${last_text}`, inline: false })
        .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
        .setColor('#5d779d')
        .setTimestamp()
    
    interaction.followUp({ embeds: [embed] });
}

module.exports = execute;
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const get_emote = require('../../league/functions/get_emote');
const Profile = require('../../league/classes/profile');
const MeowDB = require('meowdb');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('profile')
        .setDescription('Muestra el perfil de un usuario de League of Legends')
        .addStringOption(option => 
            option.setName('region')
                .setDescription('Región del usuario')
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
                ))
            .addStringOption(option => option.setName('usuario').setDescription('Nombre de usuario de League of Legends').setRequired(false))
            .addUserOption(option => option.setName('mención').setDescription('Usuario de Discord').setRequired(false)),
    async execute(interaction) {
        var username = interaction.options.getString('usuario');
        var region = interaction.options.getString('region');
        var mención = interaction.options.getUser('mención');

        var db = new MeowDB({
            dir: './src/database',
            name: 'accounts'
        });

        if (!username || !region) {
            if (mención) {
                var acc = db.get(mención.id);
                if (acc) {
                    var puuid = acc.summoner.identifiers.puuid;
                    region = acc.region.id;
                } else {
                    var embed = new EmbedBuilder()
                        .setAuthor({ name: '¡Algo ha salido mal!', iconURL: 'https://media.discordapp.net/attachments/1040519867578728481/1044021176177012798/939.jpg' })
                        .setTitle('Esto es lo que ha pasado:')
                        .setDescription('El usuario no tiene ninguna cuenta enlazada')
                        .setThumbnail('https://cdn.discordapp.com/attachments/1040519867578728481/1044017562775719967/unknown.png')
                        .setColor('#5d779d')
                        .setFooter({ text: `Solicitado por ${interaction.user.username}`})
                        .setTimestamp();
                    return await interaction.followUp({ embeds: [embed] });
                }
            } else {
                var acc = db.get(interaction.user.id);
                if (acc) {
                    var puuid = acc.summoner.identifiers.puuid;
                    region = acc.region.id;
                } else {
                    var embed = new EmbedBuilder()
                        .setAuthor({ name: '¡Algo ha salido mal!', iconURL: 'https://media.discordapp.net/attachments/1040519867578728481/1044021176177012798/939.jpg' })
                        .setTitle('Esto es lo que ha pasado:')
                        .setDescription('No has especificado ningún usuario y no tienes ninguna cuenta enlazada')
                        .setThumbnail('https://cdn.discordapp.com/attachments/1040519867578728481/1044017562775719967/unknown.png')
                        .setColor('#5d779d')
                        .setFooter({ text: `Solicitado por ${interaction.user.username}`})
                        .setTimestamp();
                    return await interaction.followUp({ embeds: [embed] });
                }
            }
        }

        const profile = new Profile();
        await profile.init(region, puuid ? puuid : username, interaction);

        if (!profile.summoner_data.identifiers.s_id) {
            var embed = new EmbedBuilder()
                .setAuthor({ name: '¡Algo ha salido mal!', iconURL: 'https://media.discordapp.net/attachments/1040519867578728481/1044021176177012798/939.jpg' })
                .setTitle('Esto es lo que ha pasado:')
                .setDescription('No he podido encontrar al usuario especificado. Asegúrate de que la región es correcta y que el nombre de usuario es correcto')
                .setThumbnail('https://cdn.discordapp.com/attachments/1040519867578728481/1044017562775719967/unknown.png')
                .setColor('#5d779d')
                .setFooter({ text: `Solicitado por ${interaction.user.username}`})
                .setTimestamp();
            return await interaction.followUp({ embeds: [embed] });
        }

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
            r_text += `${solo.wins} Victorias - ${solo.losses} Derrotas (${solo.winrate}%WR)\n`;
        } else if (profile.ranked.flex.tier) {
            var flex = profile.ranked.flex;
            r_name += `Estadísticas de Flex 5v5`;
            r_text += `${flex.emote} ${flex.tier} ${flex.rank}\n`;
            r_text += `${flex.lps} Puntos de Liga\n`;
            r_text += `${flex.wins} Victorias - ${flex.losses} Derrotas (${flex.winrate}%WR)\n`;
        } else {
            r_name += `Estadísticas de Ranked`;
            r_text += `No hay datos para mostrar.\n`;
        }
    
        var live_text = ''; var live_url = '';
        if (profile.livegame.ingame) {
            var live = profile.livegame;
            live_url = `https://porofessor.gg/es/live/${profile.region.name.toLowerCase()}/${profile.summoner_data.name.split(' ').join('%20')}`;
            live_text += `🟢 **Jugando:** ${live.champion.emote} ${live.champion.name} - ${live.map.name} - ${live.queue.name}\n`;
            live_text += `🕐 **Tiempo transcurrido:** ${Math.floor(live.time.duration / 60)}:${live.time.duration % 60 < 10 ? '0' + live.time.duration % 60 : live.time.duration % 60}\n`;
            live_text += `📅 **Fecha:** ${new Date(live.time.start).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} - 🔗 **Enlace:** [Porofessor](${live_url})`;
        } else {
            live_text += `Este jugador no está en partida en este momento.`;
        }
    
        var last_text = ''; var last_url = ''; var wintext = ''; var last_name = '';
        if (profile.lastgames.matches[0].game_id) {
            var last = profile.lastgames.matches[0];
            var cs_e = get_emote('minioncount');
            typeof last.stats.win === 'boolean' ? wintext = last.stats.win ? `🟢 **Victoria**` : `🔴 **Derrota**` : wintext = `⚙️ **Remake**`;
            last_url = `https://www.leagueofgraphs.com/es/match/${profile.region.name.toLowerCase()}/${last.game_id.split('_')[1]}`;
            last_name = `Última partida: ${last.map.name} - ${last.queue.name}`;
            last_text += `${wintext} con ${last.champion.emote} ${last.champion.name} - ${last.stats.kills}/${last.stats.deaths}/${last.stats.assists} `;
            last_text += `${last.stats.cs} ${cs_e} (${last.stats.cs_per_min} ${cs_e}/min)\n`;
            last_text += `🕐 **Duración de la partida:** ${Math.floor(last.time.duration / 60)}:${last.time.duration % 60 < 10 ? '0' + last.time.duration % 60 : last.time.duration % 60}\n`;
            last_text += `📅 **Fecha:** ${new Date(last.time.start).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} - 🔗 **Enlace:** [League of Graphs](${last_url})`;
        } else {
            last_name = `Última partida:`;
            last_text += `No hay datos para mostrar.`;
        }
    
        var leagueofgraphs = `https://www.leagueofgraphs.com/es/summoner/${profile.region.name.toLowerCase()}/${profile.summoner_data.name.split(' ').join('%20')}`;
    
        var embed = new EmbedBuilder()
            .setAuthor({ name: `${profile.region.name} - ${profile.summoner_data.name}`, iconURL: profile.summoner_data.icon.url, url: leagueofgraphs })
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
};
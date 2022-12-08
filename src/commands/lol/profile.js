const { SlashCommandSubcommandBuilder, EmbedBuilder, TimestampStyles, time } = require('discord.js');
const get_summoner = require('../../util/functions/league/get_summoner');
const get_emote = require('../../util/functions/league/get_emote');
const Profile = require('../../util/classes/league/profile');
const error = require('../../util/functions/error');

async function execute(interaction) {
    var summoner = await get_summoner(interaction);
    if (typeof summoner == 'string') return error(interaction, summoner);

    const profile = await new Profile().init(summoner.region.id, summoner.data.identifiers.puuid);

    var m_text = '';
    for (var i = 0; i < 3; i++) {
        if (profile.masteries.champions[i].champion.name) {
            var champion = profile.masteries.champions[i].champion;
            var mastery = profile.masteries.champions[i];
            m_text += interaction.locale.profile_command.masteries_row
                .replace('{{emote}}', champion.emote)
                .replace('{{level}}', mastery.champion_level)
                .replace('{{champion}}', champion.name)
                .replace('{{points}}', mastery.champion_points.toLocaleString(interaction.lang));
        } else {
            m_text += 'N/A\n';
            break;
        }
    }

    var r_text = ''; var queue = '';
    if (profile.ranked.solo.tier || profile.ranked.flex.tier) {
        var ranked = profile.ranked.solo.tier ? profile.ranked.solo : profile.ranked.flex;
        r_text = interaction.locale.profile_command.ranked.clasified
            .replace('{{emote}}', ranked.emote)
            .replace('{{tier}}', interaction.locale.ranks[ranked.tier])
            .replace('{{division}}', ranked.rank)
            .replace('{{lp}}', ranked.lps)
            .replace('{{wins}}', ranked.wins)
            .replace('{{losses}}', ranked.losses)
            .replace('{{winrate}}', ranked.winrate);
        queue = interaction.locale.queues['420'];
    } else {
        r_text = interaction.locale.profile_command.ranked.unclasified;
        queue = interaction.locale.queues['-1'];
    }

    var live_text = '';
    if (profile.livegame.ingame) {
        var livegame = profile.livegame;
        live_text = interaction.locale.profile_command.playing.playing
            .replace('{{emote}}', livegame.champion.emote)
            .replace('{{champion}}', livegame.champion.name)
            .replace('{{map}}', interaction.locale.maps[livegame.map])
            .replace('{{queue}}', interaction.locale.queues[livegame.queue])
            .replace('{{time}}', `${Math.floor(live.time.duration / 60)}:${live.time.duration % 60 < 10 ? '0' + live.time.duration % 60 : live.time.duration % 60}`)
            .replace('{{date}}', time(new Date(live.time.start), TimestampStyles.ShortDateTime))
            .replace('{{region}}', profile.region.name.toLowerCase())
            .replace('{{name}}', profile.summoner_data.name);
    } else {
        live_text = interaction.locale.profile_command.playing.not_playing;
    }

    var lastgame = '';
    if (profile.lastgames.matches[0].game_id) {
        var last = profile.lastgames.matches[0];
        var wintext = typeof last.stats.win === 'boolean' ? last.stats.win ? interaction.locale.win.win : interaction.locale.win.loss : interaction.locale.win.remake;
        lastgame = interaction.locale.profile_command.embed.fields[6].value
            .replace('{{win}}', wintext)
            .replace('{{emote}}', last.champion.emote)
            .replace('{{champion}}', last.champion.name)
            .replace('{{kills}}', last.stats.kills)
            .replace('{{deaths}}', last.stats.deaths)
            .replace('{{assists}}', last.stats.assists)
            .replace('{{cs}}', last.stats.cs)
            .replace('{{cs_emote}}', get_emote('cs'))
            .replace('{{cspm}}', last.stats.cspm)
            .replace('{{duration}}', `${Math.floor(last.time.duration / 60)}:${last.time.duration % 60 < 10 ? '0' + last.time.duration % 60 : last.time.duration % 60}`)
            .replace('{{date}}', time(new Date(last.time.start), TimestampStyles.ShortDateTime))
            .replace('{{region}}', profile.region.name.toLowerCase())
            .replace('{{match_id}}', last.game_id.split('_')[1]);
    } else {
        lastgame = 'N/A';
    }

    var user = interaction.options.getUser('mención') || interaction.options.getUser('mention')
    if (!user && !interaction.options.getString('jugador') && !interaction.options.getString('player')) {
        user = interaction.user;
    }

    var embed = new EmbedBuilder()
        .setAuthor({
            name: interaction.locale.profile_command.embed.author.name
                .replace('{{region}}', profile.region.name)
                .replace('{{name}}', profile.summoner_data.name)
                .replace('{{discord}}', user ? ` - ${user.tag}` : ''),
            iconURL: profile.summoner_data.icon.url
        })
        .setTitle(interaction.locale.profile_command.embed.title)
        .addFields(
            { 
                name: interaction.locale.profile_command.embed.fields[0].name, 
                value: interaction.locale.profile_command.embed.fields[0].value
                    .replace('{{level}}', profile.summoner_data.level), 
                inline: true 
            },
            {
                name: interaction.locale.profile_command.embed.fields[1].name,
                value: interaction.locale.profile_command.embed.fields[1].value
                    .replace('{{score}}', profile.masteries.score),
                inline: true
            },
            {
                name: interaction.locale.profile_command.embed.fields[2].name,
                value: interaction.locale.profile_command.embed.fields[2].value
                    .replace('{{winrate}}', profile.lastgames.winrate),
                inline: true
            },
            {
                name: interaction.locale.profile_command.embed.fields[3].name,
                value: m_text,
                inline: true
            },
            {
                name: interaction.locale.profile_command.embed.fields[4].name
                    .replace('{{queue}}', queue),
                value: r_text,
                inline: true
            },
            {
                name: interaction.locale.profile_command.embed.fields[5].name,
                value: live_text,
                inline: false
            },
            {
                name: interaction.locale.profile_command.embed.fields[6].name
                    .replace('{{map}}', interaction.locale.maps[profile.lastgames.matches[0].map])
                    .replace('{{queue}}', interaction.locale.queues[profile.lastgames.matches[0].queue]),
                value: lastgame,
                inline: false
            }
        )
        .setFooter({
            text: interaction.locale.profile_command.embed.footer.text
                .replace('{{requester}}', interaction.user.tag),
            iconURL: interaction.user.avatarURL()
        })
        .setColor(interaction.locale.profile_command.embed.color)
        .setTimestamp();
    return interaction.followUp({ embeds: [embed] });
}

const data = new SlashCommandSubcommandBuilder()
    .setName('profile')
    .setNameLocalizations({
        'es-ES': 'perfil',
    })
    .setDescription('Shows a player profile')
    .setDescriptionLocalizations({
        'es-ES': 'Muestra el perfil de un jugador',
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
const { SlashCommandSubcommandBuilder, EmbedBuilder, TimestampStyles, time } = require('discord.js');
const get_emote = require('../../util/league/functions/get_emote');
const get_user = require('../../util/league/functions/get_user');
const Profile = require('../../util/league/classes/profile');
const MeowDB = require('meowdb');

var servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('profile').setNameLocalization('es-ES', 'perfil')
        .setDescription('Shows the profile of a player')
        .setDescriptionLocalization('es-ES', 'Muestra el perfil de un usuario de League of Legends')
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
            .setName('mention').setNameLocalization('es-ES', 'mención')
            .setDescription('Discord user').setDescriptionLocalization('es-ES', 'Usuario de Discord')
            .setRequired(false)),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        var identifiers = await get_user(interaction);
        if (typeof identifiers == 'string') return error(interaction, locale, identifiers);

        const profile = await new Profile().init(identifiers.region.id, identifiers.puuid);
        var localized_data = locale.profile_command;

        var m_text = '';
        for (var i = 0; i < 3; i++) {
            if (profile.masteries.champions[i].champion.name) {
                var champion = profile.masteries.champions[i].champion;
                var mastery = profile.masteries.champions[i];
                m_text += localized_data.masteries_row
                    .replace('{{emote}}', champion.emote)
                    .replace('{{level}}', mastery.champion_level)
                    .replace('{{champion}}', champion.name)
                    .replace('{{points}}', mastery.champion_points.toLocaleString(lang));
            } else {
                m_text += 'N/A\n';
                break;
            }
        }

        var r_text = ''; var queue = '';
        if (profile.ranked.solo.tier || profile.ranked.flex.tier) {
            var ranked = profile.ranked.solo.tier ? profile.ranked.solo : profile.ranked.flex;
            r_text = localized_data.ranked.clasified
                .replace('{{emote}}', ranked.emote)
                .replace('{{tier}}', locale.ranks[ranked.tier])
                .replace('{{division}}', ranked.rank)
                .replace('{{lp}}', ranked.lps)
                .replace('{{wins}}', ranked.wins)
                .replace('{{losses}}', ranked.losses)
                .replace('{{winrate}}', ranked.winrate);
            queue = locale.queues['420'];
        } else {
            r_text = localized_data.ranked.unclasified;
            queue = locale.queues['-1'];
        }

        var live_text = '';
        if (profile.livegame.ingame) {
            var livegame = profile.livegame;
            live_text = localized_data.playing.playing
                .replace('{{emote}}', livegame.champion.emote)
                .replace('{{champion}}', livegame.champion.name)
                .replace('{{map}}', locale.maps[livegame.map])
                .replace('{{queue}}', locale.queues[livegame.queue])
                .replace('{{time}}', `${Math.floor(live.time.duration / 60)}:${live.time.duration % 60 < 10 ? '0' + live.time.duration % 60 : live.time.duration % 60}`)
                .replace('{{date}}', time(new Date(live.time.start), TimestampStyles.ShortDateTime))
                .replace('{{region}}', profile.region.name.toLowerCase())
                .replace('{{name}}', profile.summoner_data.name);
        } else {
            live_text = localized_data.playing.not_playing;
        }

        var lastgame = '';
        if (profile.lastgames.matches[0].game_id) {
            var last = profile.lastgames.matches[0];
            var wintext = typeof last.stats.win === 'boolean' ? last.stats.win ? locale.win.win : locale.win.loss : locale.win.remake;
            lastgame = localized_data.embed.fields[6].value
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
                name: localized_data.embed.author.name
                    .replace('{{region}}', profile.region.name)
                    .replace('{{name}}', profile.summoner_data.name)
                    .replace('{{discord}}', user ? ` - ${user.tag}` : ''),
                iconURL: profile.summoner_data.icon.url
            })
            .setTitle(localized_data.embed.title)
            .addFields(
                { 
                    name: localized_data.embed.fields[0].name, 
                    value: localized_data.embed.fields[0].value
                        .replace('{{level}}', profile.summoner_data.level), 
                    inline: true 
                },
                {
                    name: localized_data.embed.fields[1].name,
                    value: localized_data.embed.fields[1].value
                        .replace('{{score}}', profile.masteries.score),
                    inline: true
                },
                {
                    name: localized_data.embed.fields[2].name,
                    value: localized_data.embed.fields[2].value
                        .replace('{{winrate}}', profile.lastgames.winrate),
                    inline: true
                },
                {
                    name: localized_data.embed.fields[3].name,
                    value: m_text,
                    inline: true
                },
                {
                    name: localized_data.embed.fields[4].name
                        .replace('{{queue}}', queue),
                    value: r_text,
                    inline: true
                },
                {
                    name: localized_data.embed.fields[5].name,
                    value: live_text,
                    inline: false
                },
                {
                    name: localized_data.embed.fields[6].name
                        .replace('{{map}}', locale.maps[profile.lastgames.matches[0].map])
                        .replace('{{queue}}', locale.queues[profile.lastgames.matches[0].queue]),
                    value: lastgame,
                    inline: false
                }
            )
            .setFooter({
                text: localized_data.embed.footer.text
                    .replace('{{requester}}', interaction.user.tag),
                iconURL: interaction.user.avatarURL()
            })
            .setColor(localized_data.embed.color)
            .setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    }
}
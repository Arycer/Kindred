const { get_title, get_url } = require('../../util/music/functions/get_song_info.js');
const create_connection = require('../../util/music/functions/create_connection');
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const create_resource = require('../../util/music/functions/create_resource');
const { getVoiceConnection } = require('@discordjs/voice');
const wait = require('../../util/music/functions/wait');
const error = require('../../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('play')
        .setNameLocalization('es-ES', 'reproducir')
        .setDescription('Plays a song')
        .setDescriptionLocalization('es-ES', 'Reproduce una canción')
        .addStringOption(option =>
            option.setName('song')
                .setNameLocalization('es-ES', 'canción')
                .setDescription('Song name')
                .setDescriptionLocalization('es-ES', 'Nombre de la canción')
                .setRequired(true)),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        var query = interaction.options.getString('canción') || interaction.options.getString('song');
        if (query.includes('list=')) return error(interaction, locale, 'playlist');
    
        var voice_channel = interaction.member.voice.channelId;
        if (!voice_channel) return error(interaction, locale, 'no-voice-channel');
    
        var connection = getVoiceConnection(interaction.guildId) ? getVoiceConnection(interaction.guildId) : await create_connection(interaction);
        var player = connection.state.subscription.player;
        var queue = connection.queue;
    
        var url = await get_url(query);
        await queue.add_song(url, interaction.user.tag);

        if (queue.playing) {
            var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.play_command.add_embed)
                .replace('{{requester}}', interaction.user.tag)
                .replace('{{requester_icon}}', interaction.user.avatarURL())
            )).setTitle(await get_title(url)).setURL(url).setTimestamp();
            interaction.followUp({ embeds: [embed] });
        } else {
            do {
                if (!queue.looped()) queue.next();
                if (!queue.current) queue.next();
                var song = queue.current;
                player.play(await create_resource(song.url));

                var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.play_command.play_embed)
                    .replace('{{requester}}', interaction.user.tag)
                    .replace('{{requester_icon}}', interaction.user.avatarURL())
                )).setTitle(song.title).setURL(song.url).setTimestamp();

                queue.playing ? interaction.channel.send({ embeds: [embed] }) : interaction.followUp({ embeds: [embed] }) && (queue.playing = true);
                await wait(player);
            } while (queue.songs.length > 0 || queue.looped());
            return connection.destroy();
        }
    }
}
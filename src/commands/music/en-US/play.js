const { get_title, get_url } = require('../../../util/music/functions/get_song_info.js.js');
const create_connection = require('../../../util/music/functions/create_connection');
const { getVoiceConnection } = require('@discordjs/voice');
const play = require('../../../util/music/functions/play');
const wait = require('../../../util/music/functions/wait');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    var query = interaction.options.getString('canción') || interaction.options.getString('song');
    if (query.includes('list=')) return interaction.followUp({ embeds: [error('es-ES', 'playlist', interaction.user.tag)] });

    var voice_channel = interaction.member.voice.channelId;
    if (!voice_channel) return interaction.followUp({ embeds: [error('es-ES', 'no-voice-channel', interaction.user.tag)] });

    var connection = getVoiceConnection(interaction.guildId) ? getVoiceConnection(interaction.guildId) : await create_connection(interaction);
    var player = connection.state.subscription.player;
    var queue = connection.queue;
    
    var requester = interaction.user.tag;
    var url = await get_url(query);
    await queue.add_song(url, requester);

    if (!queue.playing) {
        queue.playing = true;
        const embed = new EmbedBuilder()
            .setAuthor({ name: '🎵 Now playing' })
            .setTitle(await get_title(url))
            .setURL(url)
            .setDescription('There are no more songs in the queue')
            .setFooter({ text: `Requested by ${requester}` })
            .setColor('#5d779d')
            .setTimestamp();
        await interaction.followUp({ embeds: [embed] });
        var nosend = true;
        do {
            queue.next();
            do {
                await play('en-US', interaction.channel, player, queue, nosend);
                await wait(player);
            } while (queue.looped());
            nosend = false;
        } while (queue.songs.length > 0);
        queue.clear();
        connection.destroy();
    } else {
        var embed = new EmbedBuilder()
            .setAuthor({ name: '🎵 Added to queue' })
            .setTitle(await get_title(url))
            .setURL(url)
            .setFooter({ text: `Requested by ${requester}` })
            .setColor('#5d779d')
            .setTimestamp();
        if (queue.songs.length == 1) {
            embed.setDescription('There is one more song in the queue');
        } else {
            embed.setDescription(`There are ${queue.songs.length} more songs in the queue`);
        }
        interaction.followUp({ embeds: [embed] });
    }
}

module.exports = run;

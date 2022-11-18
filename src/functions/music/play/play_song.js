const create_connection = require('../create/create_connection');
const { get_title, get_url } = require('../fetch/get_info.js');
const { getVoiceConnection } = require('@discordjs/voice');
const create_embed = require('../create/create_embed');
const play_playlist = require('./play_playlist');
const play = require('./play');
const wait = require('./wait');

async function play_song (interaction, query) {
    if (query.includes('list=')) return await play_playlist(interaction, query);

    var voice_channel = interaction.member.voice.channelId;
    if (!voice_channel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });

    var connection = getVoiceConnection(interaction.guildId) ? getVoiceConnection(interaction.guildId) : await create_connection(interaction);
    var player = connection.state.subscription.player;
    var queue = connection.queue;
    
    var requester = interaction.user.tag;
    var url = await get_url(query);
    await queue.add_song(url, requester);
	
	var embed = create_embed('add_q',{
		title: await get_title(url),
		url: url,
		queue: queue,
		requester: requester
	});

    if (!queue.playing) {
        interaction.deleteReply();
        queue.playing = true;
        do {
            queue.next();
            do {
                await play(interaction.channel, player, queue);
                await wait(player);
            } while (queue.looped());
        } while (queue.songs.length > 0);
		queue.clear();
		connection.destroy();
    } else interaction.followUp({ embeds: [embed] });
}

module.exports = play_song;

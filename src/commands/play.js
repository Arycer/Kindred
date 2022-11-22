const { get_title, get_url } = require('../music/functions/get_song_info.js');
const create_connection = require('../music/functions/create_connection');
const create_embed = require('../music/functions/create_embed');
const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');
const play = require('../music/functions/play');
const wait = require('../music/functions/wait');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción')
        .addStringOption(option =>
            option.setName('canción')
                .setDescription('Nombre de la canción')
                .setRequired(true)),
    async execute(interaction) {
        var query = interaction.options.getString('canción');

        if (query.includes('list=')) return interaction.followUp({ content: 'El soporte para listas de reproducción está desactivado.', ephemeral: true });

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
            queue.playing = true;
            const embed = create_embed('firstplay', {
                requester: requester,
                title: await get_title(url),
                url: url
            });
            await interaction.followUp({ embeds: [embed] });
            var nosend = true;
            do {
                queue.next();
                do {
                    await play(interaction.channel, player, queue, nosend);
                    await wait(player);
                } while (queue.looped());
                nosend = false;
            } while (queue.songs.length > 0);
            queue.clear();
            connection.destroy();
        } else interaction.followUp({ embeds: [embed] });
    },
};

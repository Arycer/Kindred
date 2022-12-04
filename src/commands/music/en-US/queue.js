const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('en-US', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('en-US', 'no-connection', interaction.user.tag)] });

    const requester = interaction.user.tag;

    const queue = connection.queue;
    const embed = new EmbedBuilder()
        .setAuthor({ name: '🎵 Queue' })
        .setDescription(`**Now playing:**\n[${queue.current.title}](${queue.current.url})`)
        .setFooter({ text: `Requested by ${requester}` })
        .setColor('#5d779d')
        .setTimestamp();
    if (queue.songs.length == 0) {
        embed.addFields({ name: 'There are no more songs in the queue.', value: 'Add more songs with /play (song)' });
    } else {
        for (let i = 0; i < queue.songs.length; i++) {
            if (i > 14) break;
            var song = queue.songs[i];
            embed.addFields({ name: `${i + 1}. ${song.title}`, value: `Requested by: ${song.requester}` });
        }
    }

    await interaction.followUp({ embeds: [embed] });
}

module.exports = run; 

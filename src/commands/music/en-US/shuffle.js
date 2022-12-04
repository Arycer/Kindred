const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('en-US', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('en-US', 'no-connection', interaction.user.tag)] });

    const queue = connection.queue;
    if (queue.songs.length < 2) return interaction.followUp({ embeds: [error('en-US', 'shuffle-error', interaction.user.tag)] });

    const requester = interaction.user.tag;
    queue.shuffle();

    const embed = new EmbedBuilder()
        .setAuthor({ name: '🎵 The queue has been shuffled.' })
        .setTitle('See the new queue with /queue')
        .setDescription(`Right now there are ${queue.songs.length} songs in the queue.`)
        .setFooter({ text: `Requested by ${requester}` })
        .setColor('#5d779d')
        .setTimestamp();
    await interaction.followUp({ embeds: [embed] });
}

module.exports = run;
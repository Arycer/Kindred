const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('en-US', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('en-US', 'no-connection', interaction.user.tag)] });

    const queue = connection.queue;
    if (queue.songs.length < 1) return interaction.followUp({ embeds: [error('en-US', 'no-songs', interaction.user.tag)] });

    const index = interaction.options.getInteger('posición') - 1 || interaction.options.getInteger('position') - 1;
    if (index < 0 || index >= queue.songs.length) return interaction.followUp({ embeds: [error('en-US', 'invalid-position', interaction.user.tag)] });

    const song = queue.remove(index)[0];

    const embed = new EmbedBuilder()
        .setAuthor({ name: '🎵 Removed song from queue' })
        .setTitle(song.title)
        .setURL(song.url)
        .setFooter({ text: `Requested by ${song.requester}` })
        .setColor('#5d779d')
        .setTimestamp();
    if (queue.songs.length == 0) {
        embed.setDescription('There are no more songs in the queue. Add more songs with /play (song)');
    } else if (queue.songs.length == 1) {
        embed.setDescription('There is only one song left in the queue. Add more songs with /play (song)');
    } else {
        embed.setDescription(`There are ${queue.songs.length} songs left in the queue.`);
    }

    await interaction.followUp({ embeds: [embed] });
}

module.exports = run;
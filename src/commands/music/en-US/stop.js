const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('en-US', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('en-US', 'no-connection', interaction.user.tag)] });

    const player = connection.state.subscription?.player;

    connection.queue.clear();
    player.stop();

    const embed = new EmbedBuilder()
        .setAuthor({ name: '🎵 The player has been stopped.' })
        .setTitle(`Use /play to add more songs to the queue.`)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setColor('#5d779d')
        .setTimestamp();
    await interaction.followUp({ embeds: [embed] });
}

module.exports = run;
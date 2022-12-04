const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('en-US', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('en-US', 'no-connection', interaction.user.tag)] });

    const player = connection.state.subscription?.player;

    if (player.state.status === AudioPlayerStatus.Paused) return interaction.followUp({ embeds: [error('en-US', 'already-paused', interaction.user.tag)] });

    player.pause();

    const embed = new EmbedBuilder()
        .setAuthor({ name: '🎵 The player has been paused.' })
        .setTitle(`Use /resume to resume the player.`)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setColor('#5d779d')
        .setTimestamp();

    await interaction.followUp({ embeds: [embed] });
}

module.exports = run;

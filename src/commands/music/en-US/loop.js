const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('en-US', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('en-US', 'no-connection', interaction.user.tag)] });

    const queue = connection.queue;

    const loop = interaction.options.getBoolean('activar') || interaction.options.getBoolean('enable');
    if (!loop) queue.loop = !queue.loop;
    else queue.loop = loop;

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎵 Loop has been ${queue.loop ? 'enabled' : 'disabled'}.` })
        .setTitle(`Loop mode: ${queue.loop ? 'on' : 'off'}`)
        .setDescription(`Use /loop to ${queue.loop ? 'disable' : 'enable'} loop.`)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setColor('#5d779d')
        .setTimestamp();
    await interaction.followUp({ embeds: [embed] });
}

module.exports = run;
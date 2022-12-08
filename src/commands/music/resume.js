const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const error = require('../../util/functions/error');

async function execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return error(interaction, interaction.locale, 'no-voice-channel');

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return error(interaction, interaction.locale, 'no-connection');

    const player = connection.state.subscription?.player;    
    if (player.state.status === AudioPlayerStatus.Playing) return error(interaction, interaction.locale, 'already-playing');    
    player.unpause();
    
    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.resume_command.embed)
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).setTimestamp();
    return interaction.followUp({ embeds: [embed] });
}

const data = new SlashCommandSubcommandBuilder()
    .setName('resume')
    .setNameLocalization('es-ES', 'reanudar')
    .setDescription('Reanuda la reproducción');

module.exports = { data, execute };
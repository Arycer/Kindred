const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const error = require('../../util/functions/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('pause')
        .setNameLocalization('es-ES', 'pausa')
        .setDescription('Pauses the player')
        .setDescriptionLocalization('es-ES', 'Pausa la reproducción'),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return error(interaction, interaction.locale, 'no-voice-channel');
    
        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) return error(interaction, interaction.locale, 'no-connection');
    
        const player = connection.state.subscription?.player;
        if (player.state.status === AudioPlayerStatus.Paused) return error(interaction, interaction.locale, 'already-paused');
        player.pause();

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.pause_command.embed)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    }
}
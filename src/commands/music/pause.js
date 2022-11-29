const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const error = require('../../util/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('pause')
        .setDescription('Pausa la reproducción'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.followUp({ embeds: [error('Debes estar en un canal de voz para usar este comando.', interaction.user.tag)] });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.followUp({ embeds: [error('No estoy reproduciendo nada en este servidor.', interaction.user.tag)] });

            const player = connection.state.subscription?.player;

            if (player.state.status === AudioPlayerStatus.Paused) return interaction.followUp({ embeds: [error('La reproducción ya está pausada.', interaction.user.tag)] });

            player.pause();

            const embed = new EmbedBuilder()
                .setAuthor({ name: '🎵 Se ha pausado la reproducción.' })
                .setTitle(`Usa /resume para reanudar la reproducción.`)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                .setColor('#5d779d')
                .setTimestamp();

            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};

const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('stop')
        .setDescription('Detiene la reproducción y elimina la cola'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.followUp({ embeds: [error('Debes estar en un canal de voz para usar este comando.', interaction.user.tag)] });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.followUp({ embeds: [error('No estoy reproduciendo nada en este servidor.', interaction.user.tag)] });

            const player = connection.state.subscription?.player;

            connection.queue.clear();
            player.stop();

            const embed = new EmbedBuilder()
                .setAuthor({ name: '🎵 Se ha detenido la reproducción.' })
                .setTitle(`Reproduce música con /play (canción)`)
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

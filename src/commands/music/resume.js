const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('resume')
        .setDescription('Reanuda la reproducción'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const player = connection.state.subscription?.player;
            if (!player) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            if (player.state.status === AudioPlayerStatus.Playing) return interaction.reply({ content: '¡La reproducción no está pausada!', ephemeral: true });

            player.unpause();

            const embed = new EmbedBuilder()
                .setAuthor({ name: '🎵 Se ha reanudado la reproducción.' })
                .setTitle(`Usa /play (canción) para añadir canciones a la cola.`)
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

const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('stop')
        .setDescription('Detiene la reproducción y elimina la cola'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const player = connection.state.subscription?.player;
            if (!player) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            if (player.state.status === AudioPlayerStatus.Idle) return interaction.reply({ content: '¡No hay nada en reproducción!', ephemeral: true });

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

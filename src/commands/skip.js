const { AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta a la siguiente canción'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel)
                return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });
        
            const connection = getVoiceConnection(interaction.guildId);
            if (!connection)
                return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });
        
            const player = connection.state.subscription?.player;
            if (!player)
                return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });
        
            if (player.state.status === AudioPlayerStatus.Idle)
                return interaction.reply({ content: '¡No hay canciones en la cola!', ephemeral: true });
        
            player.stop();
        
            interaction.editReply({ content: '¡Canción saltada!' });

            setTimeout(() => {
                interaction.deleteReply();
            }, 60000);
        } catch (error) {
            console.log(error);
        }
    }
};
const { AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
            
            const queue = connection.queue;
        
            const player = connection.state.subscription?.player;
            if (!player) 
                return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });
        
            if (player.state.status === AudioPlayerStatus.Idle) 
                return interaction.reply({ content: '¡No hay canciones en la cola!', ephemeral: true });
        
            player.stop();
            
            const embed = new EmbedBuilder()
                .setAuthor({ name: '🎵 Se ha saltado la canción.' })
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                .setColor('#5d779d')
                .setTimestamp();
            if (queue.songs.length == 0) {
                embed.setTitle('No hay más canciones en la cola.');
                embed.setDescription('Reproduce música con /play (canción)');
            } else {
                embed.setTitle(`Reproduciendo la siguiente canción`)
                embed.setDescription(`Añade canciones a la cola con /play (canción)`);
            }
            interaction.followUp({ embeds: [embed] });

            setTimeout(() => {
                interaction.deleteReply();
            }, 60000);
        } catch (error) {
            console.log(error);
        }
    }
};
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('skip')
        .setDescription('Salta a la siguiente canción'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel)return interaction.followUp({ embeds: [error('Debes estar en un canal de voz para usar este comando.', interaction.user.tag)] });
        
            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.followUp({ embeds: [error('No estoy reproduciendo nada en este servidor.', interaction.user.tag)] });
            
            const queue = connection.queue;
            const player = connection.state.subscription?.player;
                
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
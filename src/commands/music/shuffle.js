const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('shuffle')
        .setDescription('Reordena la cola de reproducción aleatoriamente'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.followUp({ embeds: [error('Debes estar en un canal de voz para usar este comando.', interaction.user.tag)] });
        
            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.followUp({ embeds: [error('No estoy reproduciendo nada en este servidor.', interaction.user.tag)] });
        
            const queue = connection.queue;
            if (queue.songs.length < 2) return interaction.followUp({ embeds: [error('La cola de reproducción debe tener al menos 2 canciones para poder reordenarla.', interaction.user.tag)] });
        
            const requester = interaction.user.tag;
            queue.shuffle();
        
            const embed = new EmbedBuilder()
                .setAuthor({ name: '🎵 Se ha reordenado la cola de reproducción.' })
                .setTitle('¡Utiliza /queue para ver la nueva cola!')
                .setDescription(`Ahora mismo hay ${queue.songs.length} canciones en la cola.`)
                .setFooter({ text: `Solicitado por ${requester}` })
                .setColor('#5d779d')
                .setTimestamp();
        
            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};

const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Reordena la cola de reproducción aleatoriamente'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });
        
            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });
        
            const queue = connection.queue;
            if (queue.length < 2) return interaction.reply({ content: '¡No hay suficientes canciones en la cola para reordenar!', ephemeral: true });
        
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

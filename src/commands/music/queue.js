const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('queue')
        .setDescription('Muestra las próximas 10 canciones'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });
        
            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const requester = interaction.user.tag;
        
            const queue = connection.queue;
            const embed = new EmbedBuilder()
                .setAuthor({ name: '🎵 Cola de reproducción:' })
                .setDescription(`**Ahora suena:**\n[${queue.current.title}](${queue.current.url})`)
                .setFooter({ text: `Solicitado por ${requester}` })
                .setColor('#5d779d')
                .setTimestamp();
            if (queue.songs.length == 0) {
                embed.addFields({ name: 'No hay más canciones en la cola.', value: 'Añade canciones con /play (canción)' });
            } else {
                for (let i = 0; i < queue.songs.length; i++) {
                    if (i > 14) break;
                    var song = queue.songs[i];
                    embed.addFields({ name: `${i + 1}. ${song.title}`, value: `Solicitada por: ${song.requester}` });
                }
            }

            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.log(error);
        }
    }
};    

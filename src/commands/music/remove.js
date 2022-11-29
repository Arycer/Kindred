const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Elimina una canción de la cola')
        .addIntegerOption(option => 
            option.setName('posición')
                .setDescription('Posición de la canción en la cola')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.followUp({ embeds: [error('Debes estar en un canal de voz para usar este comando.', interaction.user.tag)] });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.followUp({ embeds: [error('No estoy reproduciendo nada en este servidor.', interaction.user.tag)] });

            const queue = connection.queue;
            if (queue.songs.length < 1) return interaction.followUp({ embeds: [error('No hay canciones en la cola.', interaction.user.tag)] });

            const index = interaction.options.getInteger('posición') - 1;
            if (index < 0 || index >= queue.songs.length) return interaction.followUp({ embeds: [error('La posición debe estar entre 1 y ' + queue.songs.length, interaction.user.tag)] });

            const song = queue.remove(index)[0];

            const embed = new EmbedBuilder()
                .setAuthor({ name: '🎵 Se ha eliminado de la cola:' })
                .setTitle(song.title)
                .setURL(song.url)
                .setFooter({ text: `Solicitado por ${song.requester}` })
                .setColor('#5d779d')
                .setTimestamp();
            if (queue.songs.length == 0) {
                embed.setDescription('No hay más canciones en la cola.');
            } else if (queue.songs.length == 1) {
                embed.setDescription('Queda una canción en la cola.');
            } else {
                embed.setDescription(`Quedan ${queue.songs.length} canciones en la cola.`);
            }

            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};

const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('es-ES', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('es-ES', 'no-connection', interaction.user.tag)] });

    const queue = connection.queue;
    if (queue.songs.length < 1) return interaction.followUp({ embeds: [error('es-ES', 'no-songs', interaction.user.tag)] });

    const index = interaction.options.getInteger('posición') - 1;
    if (index < 0 || index >= queue.songs.length) return interaction.followUp({ embeds: [error('es-ES', 'invalid-position', interaction.user.tag)] });

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

module.exports = run;
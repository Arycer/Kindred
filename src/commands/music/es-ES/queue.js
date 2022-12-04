const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('es-ES', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('es-ES', 'no-connection', interaction.user.tag)] });

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
} 

module.exports = run;
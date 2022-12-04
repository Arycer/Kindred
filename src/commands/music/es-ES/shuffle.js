const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.followUp({ embeds: [error('es-ES', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('es-ES', 'no-connection', interaction.user.tag)] });

    const queue = connection.queue;
    if (queue.songs.length < 2) return interaction.followUp({ embeds: [error('es-ES', 'shuffle-error', interaction.user.tag)] });

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

module.exports = run;
const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)return interaction.followUp({ embeds: [error('es-ES', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('es-ES', 'no-connection', interaction.user.tag)] });
    
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
    return interaction.followUp({ embeds: [embed] });
} 

module.exports = run;
const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)return interaction.followUp({ embeds: [error('en-US', 'no-voice-channel', interaction.user.tag)] });

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return interaction.followUp({ embeds: [error('en-US', 'no-connection', interaction.user.tag)] });
    
    const queue = connection.queue;
    const player = connection.state.subscription?.player;
        
    player.stop();
    
    const embed = new EmbedBuilder()
        .setAuthor({ name: '🎵 The player has been skipped.' })
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setColor('#5d779d')
        .setTimestamp();
    if (queue.songs.length == 0) {
        embed.setTitle('There are no more songs in the queue.');
        embed.setDescription('Use /play to add more songs to the queue.');
    } else {
        embed.setTitle(`Playing the next song in the queue.`);
        embed.setDescription(`Add more songs to the queue with /play (song)`);
    }
    return interaction.followUp({ embeds: [embed] });
} 

module.exports = run;
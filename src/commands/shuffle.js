const create_embed = require('../functions/music/create/create_embed');
const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

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
        
            const embed = create_embed('shuffle', {
                requester: requester,
                queue: queue
            });
        
            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};
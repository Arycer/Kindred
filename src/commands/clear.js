const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const create_embed = require('../functions/music/create/create_embed');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina la cola de reproducción'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.followUp({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.followUp({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const player = connection.state.subscription?.player;
            if (!player) return interaction.followUp({ content: '¡No estás reproduciendo música!', ephemeral: true });

            if (player.state.status === AudioPlayerStatus.Idle) return interaction.followUp({ content: '¡No hay nada en reproducción!', ephemeral: true });

            connection.queue.empty();

            const embed = create_embed('clear', {
                requester: interaction.user.tag
            });

            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const create_embed = require('../functions/create_embed');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Reanuda la reproducción'),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const player = connection.state.subscription?.player;
            if (!player) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            if (player.state.status === AudioPlayerStatus.Playing) return interaction.reply({ content: '¡La reproducción no está pausada!', ephemeral: true });

            player.unpause();

            const embed = create_embed('resume', {
                requester: interaction.user.tag
            });

            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};
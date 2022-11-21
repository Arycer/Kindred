const create_embed = require('../functions/create_embed');
const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Activa o desactiva la canción actual')
        .addBooleanOption(option =>
            option.setName('activar')
                .setDescription('Activar o desactivar el bucle')),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const player = connection.state.subscription?.player;
            if (!player) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const queue = connection.queue;

            const loop = interaction.options.getBoolean('activar');
            if (!loop) queue.loop = !queue.loop;
            else queue.loop = loop;

            const embed = create_embed('loop', {
                requester: interaction.user.tag,
                queue: queue
            });

            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};


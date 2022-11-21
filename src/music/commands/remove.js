const create_embed = require('../functions/create_embed');
const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Elimina una canción de la cola')
        .addIntegerOption(option => 
            option.setName('posición')
                .setDescription('Posición de la canción en la cola')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const queue = connection.queue;
            if (queue.length < 1) return interaction.reply({ content: '¡No hay canciones en la cola para eliminar!', ephemeral: true });

            const index = interaction.options.getInteger('posición') - 1;
            if (index < 0 || index >= queue.length) return interaction.reply({ content: '¡La posición no es válida!', ephemeral: true });

            const song = queue.remove(index);

            const embed = create_embed('remove', {
                requester: interaction.user.tag,
                queue: queue,
                song: song
            });

            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};
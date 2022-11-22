const play_song = require('../music/functions/play_song');

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción')
        .addStringOption(option =>
            option.setName('canción')
                .setDescription('Nombre de la canción')
                .setRequired(true)),
    async execute(interaction) {
        var query = interaction.options.getString('canción');
        return await play_song(interaction, query);
    },
};

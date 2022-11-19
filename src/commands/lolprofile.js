const embed_profile = require('../functions/league/create/embed_profile');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lolprofile')
        .setDescription('Muestra el perfil de un usuario de League of Legends')
        .addStringOption(option => option.setName('usuario').setDescription('Nombre de usuario de League of Legends').setRequired(true)),
    async execute(interaction) {
        try {
            const username = interaction.options.getString('usuario');
            const embed = await embed_profile(username, interaction.user.tag);
            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};
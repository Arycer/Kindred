const embed_profile = require('../functions/league/create/embed_profile');
const not_found = require('../functions/league/create/not_found');
const Profile = require('../functions/league/classes/profile');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lolprofile')
        .setDescription('Muestra el perfil de un usuario de League of Legends')
        .addStringOption(option => 
            option.setName('region')
                .setDescription('Región del usuario')
                .setRequired(true)
                .addChoices(
                    { name: 'EUW', value: 'euw1' },
                    { name: 'EUNE', value: 'eun1' },
                    { name: 'NA', value: 'na1' },
                    { name: 'BR', value: 'br1' },
                    { name: 'LAN', value: 'la1' },
                    { name: 'LAS', value: 'la2' },
                    { name: 'OCE', value: 'oc1' },
                    { name: 'TR', value: 'tr1' },
                    { name: 'RU', value: 'ru' },
                    { name: 'JP', value: 'jp1' },
                    { name: 'KR', value: 'kr' },
                ))
            .addStringOption(option => option.setName('usuario').setDescription('Nombre de usuario de League of Legends').setRequired(true)),
    async execute(interaction) {
        try {
            const username = interaction.options.getString('usuario');
            const region = interaction.options.getString('region');

            const profile = new Profile();
            await profile.init(region, username, interaction);

            if (profile.summoner_data.summoner_id) {
                const embed = await embed_profile(profile, interaction);
                await interaction.followUp({ embeds: [embed] });
            } else {
                const embed = not_found(username, interaction);
                await interaction.followUp({ embeds: [embed] });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
};
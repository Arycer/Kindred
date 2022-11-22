const Account = require('../league/classes/account');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Enlaza tu cuenta de League of Legends con tu cuenta de Discord')
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

            const account = new Account();
            await account.link(interaction, region, username);
        }
        catch (error) {
            console.log(error);
        }
    }
};

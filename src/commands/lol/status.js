const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('status').setNameLocalization('es-ES', 'estado')
        .setDescription('Shows the status of the specified League of Legends region')
        .setDescriptionLocalization('es-ES', 'Muestra el estado de la región de League of Legends especificada')
        .addStringOption(option => option
            .setName('region').setNameLocalization('es-ES', 'región')
            .setDescription('Region name').setDescriptionLocalization('es-ES', 'Nombre de la región')
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
            )
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/status`);
        return await run(interaction);
    }
}
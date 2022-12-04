const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('build')
        .setDescription('Shows the build of a champion')
        .setDescriptionLocalization('es-ES', 'Muestra la build de un campeón')
        .addStringOption(option => option
            .setName('champion').setNameLocalization('es-ES', 'campeón')
            .setDescription('Champion name').setDescriptionLocalization('es-ES', 'Nombre del campeón')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('position').setNameLocalization('es-ES', 'posición')
            .setDescription('Position of the champion').setDescriptionLocalization('es-ES', 'Posición del campeón')
            .setRequired(true)
            .addChoices(
                { name: 'Top', value: 'top' },
                { name: 'Jungle', value: 'jungle', name_localizations: { 'es-ES': 'Jungla' } },
                { name: 'Mid', value: 'mid' },
                { name: 'ADC', value: 'adc' },
                { name: 'Support', value: 'support' },
            )
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/build`)
        return await run(interaction);
    }
};
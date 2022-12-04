const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('loop')
        .setNameLocalization('es-ES', 'bucle')
        .setDescription('Enables or disables loop mode')
        .setDescriptionLocalization('es-ES', 'Activa o desactiva el modo de bucle')
        .addBooleanOption(option =>
            option.setName('enable')
                .setNameLocalization('es-ES', 'activar')
                .setDescription('Enables or disables loop mode')
                .setDescriptionLocalization('es-ES', 'Activar o desactivar el bucle')),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/loop`);
        return await run(interaction);
    }
};


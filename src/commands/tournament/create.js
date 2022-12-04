const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('create').setNameLocalization('es-ES', 'crear')
        .setDescription('Creates a tournament').setDescriptionLocalization('es-ES', 'Crea un torneo')
        .addStringOption(option => option
            .setName('name').setNameLocalization('es-ES', 'nombre')
            .setDescription('Name of the tournament').setDescriptionLocalization('es-ES', 'Nombre del torneo')
            .setRequired(true)),
        async execute(interaction) {
            var lang = servers.get(interaction.guild.id).language;
            var run = require(`./${lang}/create`);
            return await run(interaction);
    }
};
        
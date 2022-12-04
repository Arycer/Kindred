const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('patch').setNameLocalization('es-ES', 'parche')
        .setDescription('Shows the latest patch notes')
        .setDescriptionLocalization('es-ES', 'Muestra las notas del último parche'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/patch`)
        return await run(interaction);
    }
};
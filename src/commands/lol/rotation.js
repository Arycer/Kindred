const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('rotation').setNameLocalization('es-ES', 'rotación')
        .setDescription('Shows the current free champions')
        .setDescriptionLocalization('es-ES', 'Muestra los campeones gratis de la semana'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/rotation`)
        return await run(interaction);
    }
};
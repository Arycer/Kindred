const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('queue')
        .setNameLocalization('es-ES', 'cola')
        .setDescription('Shows the music queue')
        .setDescriptionLocalization('es-ES', 'Muestra la cola de reproducción'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/queue`);
        return await run(interaction);
    }
};    

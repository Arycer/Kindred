const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('clear')
        .setDescription('Clears the queue')
        .setDescriptionLocalization('es-ES', 'Elimina la cola de reproducción'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/clear`);
        return await run(interaction);
    }
};
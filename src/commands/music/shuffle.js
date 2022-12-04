const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('shuffle')
        .setNameLocalization('es-ES', 'reordenar')
        .setDescription('Shuffles the queue')
        .setDescriptionLocalization('es-ES', 'Reordena la cola de reproducción'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/shuffle`);
        return await run(interaction);
    }
};

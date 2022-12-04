const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('pause')
        .setNameLocalization('es-ES', 'pausa')
        .setDescription('Pauses the player')
        .setDescriptionLocalization('es-ES', 'Pausa la reproducción'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/pause`);
        return await run(interaction);
    }
};

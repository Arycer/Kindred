const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('skip')
        .setNameLocalization('es-ES', 'saltar')
        .setDescription('Skips the current song')
        .setDescriptionLocalization('es-ES', 'Salta la canción actual'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/skip`);
        return await run(interaction);
    }
};
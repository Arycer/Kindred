const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('unlink').setNameLocalization('es-ES', 'desvincular')
        .setDescription('Unlink your League of Legends account from your Discord account')
        .setDescriptionLocalization('es-ES', 'Desvincula tu cuenta de League of Legends de tu cuenta de Discord'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/unlink`)
        return await run(interaction);
    }
};
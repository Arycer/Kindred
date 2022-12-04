const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('play')
        .setNameLocalization('es-ES', 'reproducir')
        .setDescription('Plays a song')
        .setDescriptionLocalization('es-ES', 'Reproduce una canción')
        .addStringOption(option =>
            option.setName('song')
                .setNameLocalization('es-ES', 'canción')
                .setDescription('Song name')
                .setDescriptionLocalization('es-ES', 'Nombre de la canción')
                .setRequired(true)),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/play`);
        return await run(interaction);
    }
};

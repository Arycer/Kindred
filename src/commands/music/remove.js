const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setNameLocalization('es-ES', 'eliminar')
        .setDescription('Removes a song from the queue')
        .setDescriptionLocalization('es-ES', 'Elimina una canción de la cola de reproducción')
        .addIntegerOption(option => 
            option.setName('position')
                .setNameLocalization('es-ES', 'posición')
                .setDescription('Song position')
                .setDescriptionLocalization('es-ES', 'Posición de la canción')
                .setRequired(true)),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/remove`);
        return await run(interaction);
    }
};

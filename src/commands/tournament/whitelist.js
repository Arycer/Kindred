const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('whitelist').setNameLocalization('es-ES', 'acceso')
        .setDescription('Whitelists a user to use tournament commands').setDescriptionLocalization('es-ES', 'Permite a un usuario usar los comandos de torneos')
        .addStringOption(option => option
            .setName('action').setNameLocalization('es-ES', 'acción')
            .setDescription('Action to perform').setDescriptionLocalization('es-ES', 'Acción a realizar')
            .setRequired(true)
            .addChoices(
                { name: 'Add', value: 'add', name_localizations: { 'es-ES': 'Añadir' } },
                { name: 'Remove', value: 'remove', name_localizations: { 'es-ES': 'Eliminar' } },
            )
        )
        .addMentionableOption(option => option
            .setName('user').setNameLocalization('es-ES', 'usuario')
            .setDescription('User to whitelist').setDescriptionLocalization('es-ES', 'Usuario a añadir')
            .setRequired(true)
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/whitelist`);
        return await run(interaction);
    }
}
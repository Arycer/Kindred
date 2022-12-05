const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const error = require('../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setNameLocalization('es-ES', 'idioma')
        .setDescription('Changes the language of the bot')
        .setDescriptionLocalization('es-ES', 'Cambia el idioma del bot')
        .addStringOption(option =>
            option.setName('language')
                .setNameLocalization('es-ES', 'idioma')
                .setDescription('New language for the bot on this server')
                .setDescriptionLocalization('es-ES', 'Nuevo idioma para el bot en este servidor')
                .setRequired(true)
                .addChoices(
                    { name: 'English', value: 'en-US' },
                    { name: 'Español', value: 'es-ES' },
                    { name: 'Deutsch', value: 'de-DE' },
                )),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;

        if (!interaction.member.permissions.has(new PermissionsBitField('ManageGuild'))) {
            return interaction.followUp({ embeds: [error(lang, 'no-perms', interaction.user.tag)] });
        }
            
        var newlang = interaction.options.getString('language') || interaction.options.getString('idioma');
        var run = require(`./etc/${newlang}/language`)
        return await run(interaction);
    }
};

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const error = require('../util/functions/error');
const MeowDB = require('meowdb');

const userdata = new MeowDB({
    dir: './src/database',
    name: 'userdata',
});

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
        if (!interaction.member?.permissions.has(new PermissionsBitField('ManageGuild')) && interaction.guild) return error(interaction, 'no-perms');
            
        var newlang = interaction.options.getString('language');
        var newlocale = require(`../locales/${newlang}.json`);

        if (interaction.guild) {
            var server = servers.get(interaction.guild.id);
            server.language = newlang;
            servers.set(interaction.guild.id, server);
        } else {
            var user = userdata.get(interaction.user.id);
            user.language = newlang;
            userdata.set(interaction.user.id, user);
        }


        var localized_data = newlocale.language_command;
        var embed = new EmbedBuilder()
            .setAuthor(localized_data.embed.author)
            .setTitle(localized_data.embed.title)
            .setDescription(localized_data.embed.description)
            .setColor(localized_data.embed.color)
            .setFooter({
                text: localized_data.embed.footer.text.replace('{{requester}}', interaction.user.tag),
                iconURL: interaction.user.avatarURL()
            })
            .setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    }
};

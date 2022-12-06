const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
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
        var locale = require(`../locales/es-ES.json`);

        if (!interaction.member.permissions.has(new PermissionsBitField('ManageGuild'))) {
            var localized_embed = locale.error_embed;
            var embed = new EmbedBuilder()
                .setAuthor(localized_embed.author)
                .setTitle(localized_embed.title)
                .setDescription(locale.error_messages['no-perms'])
                .setColor(localized_embed.color)
                .setFooter({
                    text: localized_embed.footer.text.replace('{{requester}}', interaction.user.tag),
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();
            return interaction.followUp({ embeds: [embed] });
        };
            
        var newlang = interaction.options.getString('language') || interaction.options.getString('idioma');
        var newlocale = require(`../locales/${newlang}.json`);

        servers.set(interaction.guild.id, {
            language: newlang,
        });

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

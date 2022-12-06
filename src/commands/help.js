const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows bot commands')
    .setDescriptionLocalization('es-ES', 'Muestra los comandos del bot')
    .addStringOption(option => 
        option.setName('category')
            .setNameLocalization('es-ES', 'módulo')
            .setDescription('Category to show commands from')
            .setDescriptionLocalization('es-ES', 'Categoría para mostrar comandos')
            .setRequired(false)
            .addChoices(
                { name: 'League of Legends', value: 'league' },
                { name: 'Music', value: 'music', name_localizations: { 'es-ES': 'Música' } }
            ))

module.exports = {
    data: data,
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../locales/${lang}.json`);

        var module = interaction.options.getString('category') || interaction.options.getString('categoría');
        var localized_data = locale.help_command;

        var embed = new EmbedBuilder()
            .setAuthor(localized_data.embed.author)
            .setDescription(localized_data.embed.description)
            .addFields(localized_data.categories[module]?.fields || localized_data.categories['no-category'].fields)
            .setColor(localized_data.embed.color)
            .setFooter({
                text: localized_data.embed.footer.text.replace('{{requester}}', interaction.user.tag),
                iconURL: interaction.user.avatarURL()
            })
            .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    }
}
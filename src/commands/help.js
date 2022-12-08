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
        var module = interaction.options.getString('category');
        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.help_command.embed)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).addFields(interaction.locale.help_command.categories[module]?.fields || interaction.locale.help_command.categories['no-category'].fields)
        return interaction.followUp({ embeds: [embed] });
    }
}
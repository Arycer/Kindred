const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { join } = require('node:path');
const MeowDB = require('meowdb');
const fs = require('fs');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows bot commands')
    .setDescriptionLocalization('es-ES', 'Muestra los comandos del bot')
    .addStringOption(option => 
        option.setName('module')
            .setNameLocalization('es-ES', 'módulo')
            .setDescription('Module to show commands from')
            .setDescriptionLocalization('es-ES', 'Módulo para mostrar comandos')
            .setRequired(false)
            .addChoices(
                { name: 'League of Legends', value: 'league' },
                { name: 'Music', value: 'music' },
            ))

module.exports = {
    data: data,
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./etc/${lang}/help`);
        return await run(interaction);
    }
}
const { SlashCommandBuilder } = require('discord.js');
const { join } = require('node:path');
const fs = require('fs');

const data = new SlashCommandBuilder()
    .setName('league')
    .setDescription('Comandos de League of Legends');

const cmd_dir = join(__dirname, 'league');
const cmd_files = fs.readdirSync(cmd_dir)
    .filter(file => file.endsWith('.js'));

for (const file of cmd_files) {
    const command = require(join(cmd_dir, file));
    data.addSubcommand(command.data);
}

module.exports = {
    data: data,
    async execute(interaction) {
        for (const file of cmd_files) {
            const command = require (join(cmd_dir, file));
            if (interaction.options.getSubcommand() === command.data.name) {
                await command.execute(interaction);
            }
        }
    }
};

const { SlashCommandBuilder } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');

const data = new SlashCommandBuilder()
    .setName('lol')
    .setDescription('League of Legends commands.')
    .setDescriptionLocalizations({
        'es-ES': 'Comandos de League of Legends.'
    });

const cmd_path = join(__dirname, 'lol');
const cmd_files = readdirSync(cmd_path)
    .filter(file => file.endsWith('.js'));

cmd_files.map(file => {
        const cmd = require(join(cmd_path, file));
        data.addSubcommand(cmd.data);
    });

module.exports = {
    data: data,
    execute(interaction) {
        cmd_files.map(file => {
            const cmd = require(join(cmd_path, file));
            if (interaction.options.getSubcommand() == cmd.data.name) cmd.execute(interaction);
        });
    }
}
const { Events } = require('discord.js');
const MeowDB = require('meowdb');

const lang = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        console.log(`${interaction.user.tag} ejecutó la interacción /${interaction.commandName} ${interaction.options.data.length ? interaction.options.data[0].name : ''}`);

        const command = client.commands.get(interaction.commandName);

        if (!command) return interaction.reply({
            content: 'That command does not exist!',
            ephemeral: true,
        });

        if (!lang.get(interaction.guild.id)) {
            lang.set(interaction.guild.id, {
                language: 'es-ES',
            });
        };

        try {
            await interaction.deferReply();
            await command.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    },
};

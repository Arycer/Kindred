const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        console.log(`${interaction.user.tag} ejecutó la interacción /${interaction.commandName}`);

        const command = client.commands.get(interaction.commandName);

        if (!command) return interaction.reply({
            content: '¡Ha ocurrido un error durante la ejecucción del comando!',
            ephemeral: true,
        });

        try {
            await interaction.deferReply();
            await command.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.followUp({
                content: '¡Ha ocurrido un error durante la ejecucción del comando!',
                ephemeral: true,
            });
        }
    },
};

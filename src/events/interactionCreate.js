const { Events } = require('discord.js');
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
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;
        console.log(`${interaction.user.tag} ejecutó la interacción /${interaction.commandName} ${interaction.options.data.length ? interaction.options.data[0].name : ''}`);

        const command = client.commands.get(interaction.commandName);

        if (!command) return interaction.reply({
            content: 'That command does not exist!',
            ephemeral: true,
        });

        if (!userdata.get(interaction.user.id).language) {
            if (!servers.get(interaction.guild.id)) {
                servers.set(interaction.guild.id, {
                    language: 'es-ES',
                });
            };
            userdata.set(interaction.user.id, {
                language: servers.get(interaction.guild.id).language,
            });
        };

        var lang = interaction.guild ? servers.get(interaction.guild.id).language : userdata.get(interaction.user.id).language;
        interaction.locale = require(`../locales/${lang}.json`);
        interaction.lang = lang;

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

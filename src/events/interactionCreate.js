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

        if (interaction.server) {
            var server = servers.get(interaction.guild?.id);
            if (!server) {
                servers.set(interaction.guild?.id, {
                    language: 'es-ES',
                });
            } else {
                if (!server.language) {
                    server.language = 'es-ES';
                    servers.set(interaction.guild?.id, server);
                }
            }
        }

        var user = userdata.get(interaction.user.id);
        if (!user) {
            userdata.set(interaction.user.id, {
                language: 'es-ES',
            });
        } else {
            if (!user.language) {
                user.language = 'es-ES';
                userdata.set(interaction.user.id, user);
            }
        }

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

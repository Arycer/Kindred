const { Events } = require('discord.js');
const MeowDB = require('meowdb');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const cmd = interaction.client.cmds.get(interaction.commandName);
        if (!cmd) return;

        const lang = interaction.guild ? handleGuildLanguage(interaction) : handleUserLanguage(interaction);

        try {
            await interaction.deferReply();
            await cmd.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'Error.', ephemeral: true })
        }
    }
};

function handleUserLanguage (interaction) {
    const userLang = db.userLang.get(interaction.user.id);
    if (userLang) return userLang;
    else {
        db.userLang.set(interaction.user.id, 'es-ES');
        return 'es-ES';
    }
}

function handleGuildLanguage (interaction) {
    const guildLang = db.guildLang.get(interaction.guild.id);
    if (guildLang) return guildLang;
    else {
        db.guildLang.set(interaction.guild.id, 'es-ES');
        return 'es-ES';
    }
}
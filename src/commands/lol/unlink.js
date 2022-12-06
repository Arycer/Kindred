const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const error = require('../../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

const db = new MeowDB({
    dir: './src/database',
    name: 'accounts'
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('unlink')
        .setDescription('Unlink your League of Legends account from your Discord account')
        .setDescriptionLocalization('es-ES', 'Desvincula tu cuenta de League of Legends de tu cuenta de Discord'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);
        var entry = db.get(interaction.user.id);
    
        if (!entry) return error(interaction, locale, 'no-linked-account');
        db.delete(interaction.user.id);

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.unlink_command.embed)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTimestamp();
        return await interaction.followUp({ embeds: [embed] });
    }
}
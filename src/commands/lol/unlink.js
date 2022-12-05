const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
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
        .setName('unlink').setNameLocalization('es-ES', 'desvincular')
        .setDescription('Unlink your League of Legends account from your Discord account')
        .setDescriptionLocalization('es-ES', 'Desvincula tu cuenta de League of Legends de tu cuenta de Discord'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);
        var entry = db.get(interaction.user.id);
    
        if (!entry) {
            var localized_error = locale.error_messages['no-linked-account']
            var localized_embed = locale.error_embed;
            var embed = new EmbedBuilder()
                .setThumbnail(localized_embed.thumbnail)
                .setAuthor(localized_embed.author)
                .setTitle(localized_embed.title)
                .setDescription(localized_error)
                .setColor(localized_embed.color)
                .setFooter({
                    text: localized_embed.footer.text.replace('{{requester}}', interaction.user.tag),
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();
            return await interaction.followUp({ embeds: [embed] });
        }
    
        db.delete(interaction.user.id);

        var localized_data = locale.unlink_command;

        var embed = new EmbedBuilder()
            .setAuthor(localized_data.embed.author)
            .setTitle(localized_data.embed.title)
            .setDescription(localized_data.embed.description)
            .setColor(localized_data.embed.color)
            .setFooter({
                text: localized_data.embed.footer.text
                    .replace('{{requester}}', interaction.user.tag),
                iconURL: interaction.user.avatarURL()
            })
            .setTimestamp();
        return await interaction.followUp({ embeds: [embed] });
    }
}
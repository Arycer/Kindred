const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const MeowDB = require('meowdb');
const axios = require('axios');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('patch').setNameLocalization('es-ES', 'parche')
        .setDescription('Shows the latest patch notes')
        .setDescriptionLocalization('es-ES', 'Muestra las notas del último parche'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        var version = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        var patch = version.data[0].split('.')[0] + '-' + version.data[0].split('.')[1];
    
        var notes = `https://www.leagueoflegends.com/${lang.toLowerCase()}/news/game-updates/patch-${patch}-notes/`;

        var localized_data = locale.patch_command;
        var embed = new EmbedBuilder()
            .setAuthor({
                name: localized_data.author.name
                    .replace('{{version}}', version.data[0]),
                iconURL: localized_data.author.iconURL,
            })
            .setTitle(localized_data.title)
            .setDescription(localized_data.description.replace('{{patch_notes}}', notes))
            .setThumbnail(localized_data.thumbnail)
            .setColor(localized_data.color)
            .setFooter({
                text: localized_data.footer.text
                    .replace('{{requester}}', interaction.user.tag),
                iconURL: interaction.user.avatarURL()
            })
            .setTimestamp();
        return await interaction.followUp({ embeds: [embed] });
    }
}
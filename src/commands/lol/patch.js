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

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.patch_command)
            .replace('{{version}}', version.data[0])
            .replace('{{patch_notes}}', notes)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    }
}
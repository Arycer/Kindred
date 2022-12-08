const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function execute(interaction) {
    var version = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    var patch = version.data[0].split('.')[0] + '-' + version.data[0].split('.')[1];

    var notes = `https://www.leagueoflegends.com/${lang.toLowerCase()}/news/game-updates/patch-${patch}-notes/`;

    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.patch_command)
        .replace('{{version}}', version.data[0])
        .replace('{{patch_notes}}', notes)
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).setTimestamp();
    return interaction.followUp({ embeds: [embed] });
}

const data = new SlashCommandSubcommandBuilder()
    .setName('patch').setNameLocalization('es-ES', 'parche')
    .setDescription('Shows the latest patch notes')
    .setDescriptionLocalization('es-ES', 'Muestra las notas del último parche');

module.exports = { data, execute };
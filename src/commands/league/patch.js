const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('patch')
        .setDescription('Muestra las notas del parche actual de League of Legends'),
    async execute(interaction) {
        var version = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        var version = version.data[0];
        var patch = version.split('.');
        var patch = patch[0] + '-' + patch[1];

        var notes = `https://www.leagueoflegends.com/es-es/news/game-updates/patch-${patch}-notes/`

        var embed = new EmbedBuilder()
            .setAuthor({ name: `Actualización ${version}`, iconURL: 'https://i.imgur.com/hGG9kLU.png' })
            .setTitle('Estas son las notas del parche actual:')
            .setDescription(`[🔗 Notas del parche](${notes})`)
            .setThumbnail('https://i.imgur.com/VhYn8km.png')
            .setColor("#5d779d")
            .setTimestamp()
            .setFooter({ text: `Solicitado por ${interaction.user.username}` });

        return interaction.followUp({ embeds: [embed] });
    }
}
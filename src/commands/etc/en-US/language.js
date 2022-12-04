const { EmbedBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

async function run(interaction) {
    var newlang = interaction.options.getString('language') || interaction.options.getString('idioma');
    servers.set(interaction.guild.id, { language: newlang });

    var embed = new EmbedBuilder()
        .setAuthor({ name: 'All set!', iconURL: 'https://i.imgur.com/hGG9kLU.png'})
        .setDescription(`The language of this server has been changed to English`)
        .setColor("#5d779d")
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}` });

    return interaction.followUp({ embeds: [embed] });
}

module.exports = run;
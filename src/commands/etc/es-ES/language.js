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
        .setAuthor({ name: '¡Todo listo!', iconURL: 'https://i.imgur.com/hGG9kLU.png'})
        .setDescription(`El idioma de este servidor ha sido cambiado a Español`)
        .setColor("#5d779d")
        .setTimestamp()
        .setFooter({ text: `Solicitado por ${interaction.user.username}` });

    return interaction.followUp({ embeds: [embed] });
}

module.exports = run;
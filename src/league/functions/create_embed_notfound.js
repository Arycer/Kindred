const { EmbedBuilder } = require('discord.js');

function not_found(username, interaction) {
    const embed = new EmbedBuilder();
    embed.setColor('#5d779d');
    embed.setTitle(`Esto es lo que ha pasado:`);
    embed.setDescription(`No he podido encontrar a ${username}. Asegúrate de que el nombre de usuario está bien escrito y que la región es correcta.`);
    embed.setThumbnail('https://cdn.discordapp.com/attachments/1040519867578728481/1044022781685276702/unknown.png');
    embed.setAuthor({ name: "¡Algo ha salido mal!", iconURL: "https://media.discordapp.net/attachments/1040519867578728481/1044021176177012798/939.jpg" });
    embed.setFooter({ text: `Solicitado por ${interaction.user.tag}` });
    embed.setTimestamp();
    return embed;
}

module.exports = not_found;
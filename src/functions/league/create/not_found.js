const { EmbedBuilder } = require('discord.js');

function not_found(username, interaction) {
    const embed = new EmbedBuilder();
    embed.setColor('#5d779d');
    embed.setTitle(`No he podido encontrar a ${username}.`);
    embed.setDescription(`Asegúrate de que el nombre de usuario es correcto. Por el momento, sólo puedo buscar perfiles de EUW.`);
    embed.setThumbnail('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/summoneremotes/champions/blitzcrank/blitzcrank_sad_confused_inventory.png');
    embed.setAuthor({
        name: "Ha ocurrido un error",
        iconURL: "https://i.redd.it/mzj3ls7pb0l31.jpg",
    });
    embed.setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
    });
    embed.setTimestamp();
    return embed;
}

module.exports = not_found;
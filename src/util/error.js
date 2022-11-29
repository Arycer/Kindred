const { EmbedBuilder } = require('discord.js');

function error (msg, requester) {
    return new EmbedBuilder()
        .setAuthor({ name: '¡Algo ha salido mal!', iconURL: 'https://i.imgur.com/hGG9kLU.png' })
        .setTitle('Esto es lo que ha pasado:')
        .setDescription(msg)
        .setThumbnail('https://i.imgur.com/81rFFJy.png')
        .setColor('#5d779d')
        .setFooter({ text: `Solicitado por ${requester}`})
        .setTimestamp();
}

module.exports = error;
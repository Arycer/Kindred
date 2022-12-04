const { EmbedBuilder } = require('discord.js');
const MeowDB = require('meowdb');

async function execute(interaction) {
    var db = new MeowDB({
        dir: './src/database',
        name: 'accounts'
    });
    
    var entry = db.get(interaction.user.id);

    if (!entry) return interaction.followUp({ embeds: [error('You don\'t have a linked account')] });

    db.delete(interaction.user.id);

    var embed = new EmbedBuilder()
        .setAuthor({ name: `All set!`, iconURL: `https://i.imgur.com/hGG9kLU.png`})
        .setThumbnail('https://i.imgur.com/BQUpB5n.png')
        .setTitle(`Your account has been unlinked successfully.`)
        .setDescription(`You can link another account by using the /link command.`)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setColor('#5d779d')
        .setTimestamp();
    await interaction.followUp({ embeds: [embed] });
}

module.exports = execute;
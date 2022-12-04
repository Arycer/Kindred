const { EmbedBuilder, userMention } = require('discord.js');
const error = require('../../../util/error');
const MeowDB = require('meowdb');

const whitelist = new MeowDB({
    name: 'tournament_whitelist',
    dir: 'src/database',
});

async function run(interaction) {
    if (!interaction.user.id == process.env.OWNER_ID) return interaction.followUp({ embeds: error('es-ES', 'no-perms', interaction.user.tag) });

    var action = interaction.options.getString('acción') || interaction.options.getString('action');
    var user = interaction.options.getMentionable('usuario') || interaction.options.getMentionable('user');

    var embed = new EmbedBuilder()
        .setAuthor({ name: 'Lista blanca de torneos', iconURL: 'https://i.imgur.com/hGG9kLU.png' })
        .setTitle('¡Listo!')
        .setDescription(`Se ha ${action === 'add' ? 'añadido a' : 'eliminado de' } a ${userMention(user.id)} los comandos de torneos.`)
        .setThumbnail('https://i.imgur.com/sqGCkzp.png')
        .setColor("#5d779d")
        .setTimestamp()
        .setFooter({ text: `Solicitado por ${interaction.user.username}` });

    if (action === 'add') {
        whitelist.set(user.id, true);
    } else if (action === 'remove') {
        whitelist.delete(user.id);
    }

    return interaction.followUp({ embeds: [embed] });
}

module.exports = run;
const { EmbedBuilder } = require('discord.js');

async function error (interaction, locale, err) {
    var localized_embed = locale.error_embed;
    var err_msg = locale.error_messages[err];
    var r = interaction.user.tag;
    var r_icon = interaction.user.avatarURL();
    var embed = JSON.parse(JSON.stringify(localized_embed).replace('{{requester}}', r).replace('{{requester_icon}}', r_icon));
    return interaction.followUp({ embeds: [new EmbedBuilder(embed).setDescription(err_msg).setTimestamp()] });
}

module.exports = error;
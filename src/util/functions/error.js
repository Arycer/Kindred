const { EmbedBuilder } = require('discord.js');

async function error (interaction, err) {
    return interaction.followUp({ embeds: [
        new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.error_embed)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setDescription(interaction.locale.error_messages[err]).setTimestamp()
    ]});
}

module.exports = error;
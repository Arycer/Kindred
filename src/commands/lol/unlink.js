const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const error = require('../../util/functions/error');
const MeowDB = require('meowdb');

const userdata = new MeowDB({
    dir: './src/database',
    name: 'userdata',
});

async function execute(interaction) {
    if (!userdata.get(interaction.user.id).league) return error(interaction, 'no-linked-account');
    var user = userdata.get(interaction.user.id);
    user.league = undefined;
    userdata.set(interaction.user.id, user);

    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.unlink_command.embed)
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).setTimestamp();
    return await interaction.followUp({ embeds: [embed] });
}

const data = new SlashCommandSubcommandBuilder()
        .setName('unlink')
        .setDescription('Unlink your League of Legends account from your Discord account')
        .setDescriptionLocalization('es-ES', 'Desvincula tu cuenta de League of Legends de tu cuenta de Discord');

module.exports = { data, execute };
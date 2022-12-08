const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/functions/error');

async function execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return error(interaction, interaction.locale, 'no-voice-channel');

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return error(interaction, interaction.locale, 'no-connection');

    const queue = connection.queue;
    const loop = interaction.options.getBoolean('enable');
    queue.loop = loop ? loop : !queue.loop;

    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.loop_command.embed)
        .replace('{{action}}', queue.loop ? interaction.locale.loop_command.actions.enable : interaction.locale.loop_command.actions.disable)
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).setTimestamp();
    return interaction.followUp({ embeds: [embed] });
}

const data = new SlashCommandSubcommandBuilder()
    .setName('loop')
    .setNameLocalization('es-ES', 'bucle')
    .setDescription('Enables or disables loop mode')
    .setDescriptionLocalization('es-ES', 'Activa o desactiva el modo de bucle')
    .addBooleanOption(option =>
        option.setName('enable')
            .setNameLocalization('es-ES', 'activar')
            .setDescription('Enables or disables loop mode')
            .setDescriptionLocalization('es-ES', 'Activar o desactivar el bucle'))

module.exports = { data, execute };
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/functions/error');

async function execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return error(interaction, interaction.locale, 'no-voice-channel');

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return error(interaction, interaction.locale, 'no-connection');
    connection.queue.clear();

    const player = connection.state.subscription?.player;
    player.stop();

    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.stop_command.embed)
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).setTimestamp();
    return interaction.followUp({ embeds: [embed] });
}

const data = new SlashCommandSubcommandBuilder()
    .setName('stop')
    .setDescription('Detiene la reproducción y elimina la cola')

module.exports = { data, execute };
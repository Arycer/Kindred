const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/functions/error');

async function execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return error(interaction, interaction.locale, 'no-voice-channel');

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) return error(interaction, interaction.locale, 'no-connection');

    const queue = connection.queue;
    if (queue.songs.length < 2) return error(interaction, interaction.locale, 'shuffle-error');

    queue.shuffle();

    var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.shuffle_command.embed)
        .replace('{{requester}}', interaction.user.tag)
        .replace('{{requester_icon}}', interaction.user.avatarURL())
    )).setTimestamp();
    return interaction.followUp({ embeds: [embed] });
}

const data = new SlashCommandSubcommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles the queue')
    .setDescriptionLocalization('es-ES', 'Reordena la cola de reproducción');

module.exports = { data, execute };
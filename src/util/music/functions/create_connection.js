const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');
const Queue = require('../classes/queue');

async function create_connection (interaction) {
    const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    connection.queue = new Queue();

    const player = createAudioPlayer();
    connection.subscribe(player);

    return connection;
}

module.exports = create_connection;
const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');
const Queue = require('../../classes/music/queue');

async function create_connection (interaction) {
    const connection = joinVoiceChannel({
        adapterCreator: interaction.guild.voiceAdapterCreator,
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId
    });

    connection.queue = new Queue();

    const player = createAudioPlayer();
    connection.subscribe(player);

    return connection;
}

module.exports = create_connection;
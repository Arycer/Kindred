const create_connection = require('../create/create_connection');
const playlist_fetch = require('../fetch/playlist_fetch');

async function play_playlist(interaction) {
    var query = interaction.options.getString('song');
    var voice_channel = interaction.member.voice.channelId;

    if (!voice_channel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });
    await interaction.deferReply();

    var connection = getVoiceConnection(interaction.guildId) ? getVoiceConnection(interaction.guildId) : create_connection(interaction);
    var playlist = await playlist_fetch(query);

    for (const song of playlist) await connection.queue.add_song(song);

    
}

module.exports = play_playlist;
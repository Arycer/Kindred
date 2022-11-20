const { createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

async function create_resource (url) {
    const audio = ytdl(url, {
        highWaterMark: 52428800,
        filter: 'audioonly'
    });
    if (audio.statusCode === 410) return null;
    const resource = createAudioResource(audio, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
    });
    return resource;
}

module.exports = create_resource;
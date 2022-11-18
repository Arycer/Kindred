const { createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

async function create_resource (url) {
    const audio = ytdl(url, {
        highWaterMark: 33554432,
        filter: 'audioonly'
    });
    const resource = createAudioResource(audio, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
    });
    return resource;
}

module.exports = create_resource;
const { createAudioResource } = require('@discordjs/voice');
const { stream } = require('play-dl');

async function create_resource (url) {
    const audio = await stream(url);
    return createAudioResource(audio.stream, {
        inputType: audio.type,
    });
}

module.exports = create_resource;
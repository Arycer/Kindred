const { AudioPlayerStatus } = require('@discordjs/voice');

async function wait(player) {
    while (player.state.status == AudioPlayerStatus.Buffering) {
        await new Promise(r => setTimeout(r, 1000));
    }
    while (player.state.status != AudioPlayerStatus.Idle && player.state.status == AudioPlayerStatus.Playing || player.state.status == AudioPlayerStatus.Paused) {
        await new Promise(r => setTimeout(r, 1000));
    }
}

module.exports = wait;
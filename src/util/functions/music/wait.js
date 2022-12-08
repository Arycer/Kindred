const { AudioPlayerStatus } = require('@discordjs/voice');

async function wait(client, player) {
    while (player.state.status == AudioPlayerStatus.Buffering) {
        await new Promise(r => setTimeout(r, 1000));
    }
    while (player.state.status != AudioPlayerStatus.Idle && player.state.status == AudioPlayerStatus.Playing || player.state.status == AudioPlayerStatus.Paused) {
        await new Promise(r => setTimeout(r, 1000));
        await leaveIfEmpty(client, player);
    }
}

function getUserCount(client, player) {
    var channel_id = player.subscribers[0].connection.packets.state.channel_id;
    var guild_id = player.subscribers[0].connection.packets.state.guild_id;
    var guild = client.guilds.cache.get(guild_id);
    var channel = guild.channels.cache.get(channel_id);
    return channel.members.size;
}

async function leaveIfEmpty(client, player) {
    if (getUserCount(client, player) <= 1) {
        await new Promise(r => setTimeout(r, 5 * 60 * 1000));
        if (getUserCount(client, player) <= 1) {
            player.stop();        
        }
    }
}

module.exports = wait;
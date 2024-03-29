const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildEmojisAndStickers,
    ]
});

function get_emote(name) {
    var emojis = client.emojis.cache;
    if (typeof name === 'string') {
        var emote = emojis.find(emoji => emoji.name.toLowerCase() == name.toLowerCase());
    } else {
        var emote = emojis.find(emoji => emoji.name == name);
    }
    if (emote) return emote.toString();
}

client.login(process.env.DISCORD_ALT);

module.exports = get_emote;
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildEmojisAndStickers,
    ]
});

function get_emote(name) {
    var emojis = client.emojis.cache;
    var emoji = emojis.find(emoji => emoji.name == name);
    if (emoji) return emoji.toString();
}

client.login(process.env.DISCORD_ALT);

module.exports = get_emote;
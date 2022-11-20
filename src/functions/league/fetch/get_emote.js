const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
    ]
});

client.once('ready', async () => {
    console.log(`Asistente iniciado como ${client.user.tag}!`);
});

function get_emote(name) {
    var emojis = client.emojis.cache;
    var emoji = emojis.find(
        emoji => emoji.name.toLowerCase() === name.toLowerCase()
    );
    return `<:${emoji.name}:${emoji.id}>`;
}

client.login(process.env.DISCORD_ALT);

module.exports = get_emote;
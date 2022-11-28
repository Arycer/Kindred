const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild, client) {
        console.log(`He sido añadido a ${guild.name} (${guild.id})`);
        console.log(`Servidores: ${client.guilds.cache.size}`);
    }
};
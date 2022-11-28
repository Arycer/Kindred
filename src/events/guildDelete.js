const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild, client) {
        console.log(`He sido eliminado de ${guild.name} (${guild.id})`);
        console.log(`Servidores: ${client.guilds.cache.size}`);
    }
};
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'interactionCreate',
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your League of Legends account to your Discord account.'),
    async execute(interaction) {
        var loginURL = await axios.get('https://api.arycer.me/kindred/login?id=' + Buffer.from(interaction.user.id).toString('base64'), {
            headers: { 'Authorization': process.env.BOT_Secret }
        });
        loginURL = loginURL.data;
        console.log(loginURL);
        await interaction.followUp(loginURL.link);
    }
}
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');
const axios = require('axios');

async function run(interaction) {
    var name = interaction.options.getString('nombre') || interaction.options.getString('name');

    var body_request = {
        name: name,
        providerId: process.env.TOURNAMENT_PROVIDER_ID
    };

    var endpoint = `https://americas.api.riotgames.com/lol/tournament/v4/tournaments?api_key=${process.env.TOURNAMENT_API_KEY}`;

    var response = await axios.post(endpoint, body_request)
        .then(async res => {
            var id = res.data;
            var embed = new EmbedBuilder()
                .setAuthor({ name: 'Kindred Bot - Tournaments', iconURL: 'https://i.imgur.com/hGG9kLU.png' })
                .setTitle('Tournament created!')
                .setDescription(`The tournament **${name}** has been created with the ID **${id}**. Configure the events with /tournament event.`)
                .setThumbnail('https://i.imgur.com/sqGCkzp.png')
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setColor('#5d779d')
                .setTimestamp();

            return await interaction.followUp({ embeds: [embed] });
        })
        .catch(err => {
            if (err.code === 'ECONNABORTED') {
                return run(interaction);
            } else {
                console.log(err);
                return interaction.followUp({ embeds: [error('en-US', 'unknown', interaction.user.tag)] });
            }
        });
    
    return response;
}

module.exports = run;
        
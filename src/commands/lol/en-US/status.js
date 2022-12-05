const Region = require('../../../util/league/classes/region');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function execute(interaction) {
    const server = interaction.options.getString('region') || interaction.options.getString('región');
    const region = new Region().get_region(server);

    const endpoint = `https://${region.id}.api.riotgames.com/lol/status/v4/platform-data`;
    const opts = {
        method: 'GET',
        timeout: 2000,
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    };

    axios.get(endpoint, opts).then((response) => {
        var data = response.data;

        var maintenances = data.maintenances;
        var incidents = data.incidents;

        var text = '';
        text += maintenances.length > 0 ? maintenances.length > 1 ? `There are **${maintenances.length}** maintenances ` : `There are **${maintenances.length}** maintenance` : 'There are no maintenances';
        text += incidents.length > 0 ? incidents.length > 1 ? ` and **${incidents.length}** incidents at the moment` : ` and **${incidents.length}** incident at the moment` : 'and there are no incidents at the moment';

        var embed = new EmbedBuilder()
            .setAuthor({ name: `Current state of ${region.name}`, iconURL: `https://media.discordapp.net/attachments/1040519867578728481/1046022952547786842/939.jpg` })
            .setThumbnail('https://cdn.discordapp.com/attachments/1040519867578728481/1046026076964532244/unknown.png')
            .setTitle(`List of events:`)
            .setDescription(text)
            .setColor("#5d779d")
            .setFooter({ text: `Requested by ${interaction.user.username}`})
            .setTimestamp();

        for (var i = 0; i < maintenances.length; i++) {
            var entry = maintenances[i];

            for (var j = 0; j < entry.updates.length; j++) {
                var update = entry.updates[j];
                var translated_update = update.translations.find(t => t.locale === 'en_US');
            }

            var translated_title = entry.titles.find(t => t.locale === 'en_US');

            embed.addFields({
                name: `Maintenance: ${translated_title.content}`,
                value: translated_update.content
            });
        }

        for (var i = 0; i < incidents.length; i++) {
            var entry = incidents[i];

            for (var j = 0; j < entry.updates.length; j++) {
                var update = entry.updates[j];
                var translated_update = update.translations.find(t => t.locale === 'en_US');
            }

            var translated_title = entry.titles.find(t => t.locale === 'en_US');

            embed.addFields({
                name: `Incident: ${translated_title.content}`,
                value: translated_update.content
            });
        }

        interaction.followUp({ embeds: [embed] });


    })
    .catch(error => {
        if (error.code === 'ECONNABORTED') {
            return execute(interaction);
        }
    });
}

module.exports = execute;
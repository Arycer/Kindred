const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Region = require('../league/classes/region');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lolstatus')
        .setDescription('Muestra el estado actual del servidor especficado de league of legends')
        .addStringOption(option => 
            option.setName('region')
                .setDescription('Región del servidor')
                .setRequired(true)
                .addChoices(
                    { name: 'EUW', value: 'euw1' },
                    { name: 'EUNE', value: 'eun1' },
                    { name: 'NA', value: 'na1' },
                    { name: 'BR', value: 'br1' },
                    { name: 'LAN', value: 'la1' },
                    { name: 'LAS', value: 'la2' },
                    { name: 'OCE', value: 'oc1' },
                    { name: 'TR', value: 'tr1' },
                    { name: 'RU', value: 'ru' },
                    { name: 'JP', value: 'jp1' },
                    { name: 'KR', value: 'kr' },
                )),
    async execute(interaction) {
        const server = interaction.options.getString('region');
        const region = new Region().get_region(server);
        console.log(region);

        const endpoint = `https://${region.id}.api.riotgames.com/lol/status/v4/platform-data`;
        const opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };
        console.log(endpoint);

        axios.get(endpoint, opts).then((response) => {
            var data = response.data;

            var maintenances = data.maintenances;
            var incidents = data.incidents;

            var maintenances_text = maintenances.length > 0 ? maintenances.length > 1 ? `Hay **${maintenances.length}** mantenimientos en curso` : `Hay **${maintenances.length}** mantenimiento en curso` : 'No hay mantenimientos en curso';
            var incidents_text = incidents.length > 0 ? incidents.length > 1 ? `Hay **${incidents.length}** incidencias en curso` : `Hay **${incidents.length}** incidencia en curso` : 'No hay incidencias en curso';

            var embed = new EmbedBuilder()
                .setAuthor({ name: `Estado del servidor ${region.name}`, iconURL: `https://media.discordapp.net/attachments/1040519867578728481/1046022952547786842/939.jpg` })
                .setThumbnail('https://cdn.discordapp.com/attachments/1040519867578728481/1046026076964532244/unknown.png')
                .setTitle(`Incidencias actuales:`)
                .setDescription(`${maintenances_text}\n${incidents_text}`)
                .setColor("#5d779d")
                .setFooter({ text: `Solicitado por ${interaction.user.username}`})
                .setTimestamp();

            for (var i = 0; i < maintenances.length; i++) {
                var entry = maintenances[i];

                for (var j = 0; j < entry.updates.length; j++) {
                    var update = entry.updates[j];
                    var translated_update = update.translations.find(t => t.locale === 'es_ES');
                }

                var translated_title = entry.titles.find(t => t.locale === 'es_ES');

                embed.addFields({
                    name: `Mantenimiento: ${translated_title.content}`,
                    value: translated_update.content
                });
            }

            for (var i = 0; i < incidents.length; i++) {
                var entry = incidents[i];

                for (var j = 0; j < entry.updates.length; j++) {
                    var update = entry.updates[j];
                    var translated_update = update.translations.find(t => t.locale === 'es_ES');
                }

                var translated_title = entry.titles.find(t => t.locale === 'es_ES');

                embed.addFields({
                    name: `Incidencia: ${translated_title.content}`,
                    value: translated_update.content
                });
            }

            interaction.followUp({ embeds: [embed] });


        })
        .catch(error => {
            if (error.code === 'ECONNABORTED') {
                console.log(`Timeout: ${endpoint}`);
                return this.execute(interaction);
            }
        });
    }
}
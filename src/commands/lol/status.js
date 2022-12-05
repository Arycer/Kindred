const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const Region = require('../../util/league/classes/region');
const MeowDB = require('meowdb');
const axios = require('axios');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('status').setNameLocalization('es-ES', 'estado')
        .setDescription('Shows the status of the specified League of Legends region')
        .setDescriptionLocalization('es-ES', 'Muestra el estado de la región de League of Legends especificada')
        .addStringOption(option => option
            .setName('region').setNameLocalization('es-ES', 'región')
            .setDescription('Region name').setDescriptionLocalization('es-ES', 'Nombre de la región')
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
            )
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);
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
    
            var localized_data = locale.status_command;
            var embed = new EmbedBuilder()
                .setAuthor({
                    name: localized_data.embed.author.name.replace('{{region}}', region.name),
                    iconURL: localized_data.embed.author.iconURL,
                })
                .setTitle(localized_data.embed.title)
                .setDescription(localized_data.embed.description.replace('{{count}}', maintenances.length).replace('{{count}}', incidents.length))
                .setThumbnail(localized_data.embed.thumbnail)
                .setColor(localized_data.embed.color)
                .setFooter({
                    text: localized_data.embed.footer.text
                        .replace('{{requester}}', interaction.user.tag),
                    iconURL: interaction.user.avatarURL(),
                })
                .setTimestamp();

            for (var i = 0; i < maintenances.length; i++) {
                var entry = maintenances[i];
                for (var j = 0; j < entry.updates.length; j++) {
                    var update = entry.updates[j];
                    var translated_update = update.translations.find(t => t.locale == lang.replace('-', '_'));
                }
    
                var translated_title = entry.titles.find(t => t.locale == lang.replace('-', '_'));
    
                embed.addFields({
                    name: localized_data.maintenance.name.replace('{{name}}', translated_title.content),
                    value: translated_update.content
                });
            }
    
            for (var i = 0; i < incidents.length; i++) {
                var entry = incidents[i];
    
                for (var j = 0; j < entry.updates.length; j++) {
                    var update = entry.updates[j];
                    var translated_update = update.translations.find(t => t.locale == lang.replace('-', '_'));
                }
    
                var translated_title = entry.titles.find(t => t.locale == lang.replace('-', '_'));
    
                embed.addFields({
                    name: localized_data.incident.name.replace('{{name}}', translated_title.content),
                    value: translated_update.content
                });
            }
    
            return interaction.followUp({ embeds: [embed] });    
        })
        .catch(error => {
            if (error.code === 'ECONNABORTED') {
                return execute(interaction);
            }
        });
    }
}
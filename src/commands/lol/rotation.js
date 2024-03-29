const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const Champion = require('../../util/classes/league/champion');
const axios = require('axios');

async function execute(interaction) {
    var endpoint = `https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations`;
    var opts = {
        method: 'GET',
        timeout: 2000,
        headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
        }
    };

    var response = await axios.get(endpoint, opts)
        .then(async (response) => {
            var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.rotation_command.embed)
                .replace('{{date}}', new Date().toLocaleString(interaction.lang))
                .replace('{{requester}}', interaction.user.tag)
                .replace('{{requester_icon}}', interaction.user.avatarURL())
            )).setTimestamp();

            var data = response.data;
            var free_champions = data.freeChampionIds;

            var half = Math.ceil(free_champions.length / 2);
            var first_half = free_champions.slice(0, half);
            var second_half = free_champions.slice(half, free_champions.length);

            for (var i = 0; i < 2; i++) {
                var text = '';
                for (var j = 0; j < half; j++) {
                    var champion = await new Champion().get_champion(i == 0 ? first_half[j] : second_half[j]);
                    text += `${champion.emote} ${champion.name}\n`;
                }
                embed.addFields({ name: "\u200B", value: text, inline: true });
            }   
            return embed;
        })
        .catch(err => {
            if (err.code == 'ECONNABORTED') {
                return execute(interaction);
            }
        });

    await interaction.followUp({ embeds: [response] });
}

const data = new SlashCommandSubcommandBuilder()
    .setName('rotation').setNameLocalization('es-ES', 'rotación')
    .setDescription('Shows the current free champions')
    .setDescriptionLocalization('es-ES', 'Muestra los campeones gratis de la semana');

module.exports = { data, execute };
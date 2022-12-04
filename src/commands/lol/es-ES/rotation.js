const Champion = require('../../../league/classes/champion');
const { EmbedBuilder } = require('discord.js');
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
            var data = response.data;
            var free_champions = data.freeChampionIds;

            var date = new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });

            var embed = new EmbedBuilder()
                .setAuthor({ name: `Rotación semanal a día ${date}`, iconURL: `https://i.imgur.com/hGG9kLU.png` })
                .setDescription(`Campeones gratis de la semana:`)
                .setThumbnail('https://i.imgur.com/wYXRu2i.png')
                .setColor("#5d779d")
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`})
                .setTimestamp();

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

module.exports = execute;
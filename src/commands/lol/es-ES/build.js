const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Champion = require('../../../util/league/classes/champion');
const error = require('../../../util/error');


async function execute(interaction) {
    var champion = interaction.options.getString('champion') || interaction.options.getString('campeón');
    var position = interaction.options.getString('position') || interaction.options.getString('posición');

    var lane = '';
    switch (position) {
        case 'top':
            lane = 'Top';
            break;
        case 'jungle':
            lane = 'Jungla';
            break;
        case 'mid':
            lane = 'Medio';
            break;
        case 'adc':
            lane = 'ADC';
            break;
        case 'support':
            lane = 'Soporte';
            break;
    }

    var champ = await new Champion().get_champion(champion);

    if (!champ) return interaction.followUp({ embeds: [error('es-ES', 'champion-not-found', interaction.user.tag)] });

    var { captureAll } = require('capture-all');
    var { join } = require('path');
    var fs = require('fs');

    var endpoint = `https://app.mobalytics.gg/lol/champions/${champ.key}/build/${position}`;
    var replied = false;

    captureAll([{
        url: endpoint,
        target: '#root > div.m-h6lown > div.m-1mjnfqh > div.m-12se98x > div > div.m-193v1r9 > main > div.m-n6k3jn > div:nth-child(1) > div.m-179t5g5 > div > div > div.m-18nur1e > div.m-2ps0tg > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)',
        remove: ['#root > div.m-h6lown > div.m-1mjnfqh > div.m-0 > div','#root > div.m-h6lown > div.m-1mjnfqh > div.m-q4t4x3', '#root > div.m-h6lown > div.m-1mjnfqh > div.m-12se98x > div > div.m-193v1r9 > main > div.m-n6k3jn > div.m-1132e0'],
        viewport: {
            width: 350,
            height: 410
        }
    }]).then(results => {
        results.forEach(async (result) => {
            var filename = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '.png';
            fs.writeFileSync(join(__dirname, filename), result.image);
            var attachment = new AttachmentBuilder(join(__dirname, filename));
            var embed = new EmbedBuilder()
                .setAuthor({ name: `Objetos recomendados para ${champ.name} - ${lane}`, iconURL: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champ.id}.png` })
                .setTitle('Esto es lo que he encontrado:')
                .setImage(`attachment://${filename}`)
                .setColor('#5d779d')
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`})
                .setTimestamp();
            await interaction.followUp({ embeds: [embed], files: [attachment] });
            fs.unlinkSync(join(__dirname, filename));
            return replied = true;
        });
    }), setTimeout(() => {
        if (!replied) return interaction.followUp({ embeds: [error('es-ES', 'build-not-found', interaction.user.tag)] });
    }, 15000);
}

module.exports = execute;
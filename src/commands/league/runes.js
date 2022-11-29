const { SlashCommandSubcommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Champion = require('../../league/classes/champion');
const error = require('../../util/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('runes')
        .setDescription('Muestra las runas de un campeón')
        .addStringOption(option =>
            option.setName('campeón')
                .setDescription('Nombre del campeón')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('posición')
                .setDescription('Posición del campeón')
                .setRequired(true)
                .addChoices(
                    { name: 'Top', value: 'top' },
                    { name: 'Jungla', value: 'jungle' },
                    { name: 'Mid', value: 'mid' },
                    { name: 'ADC', value: 'adc' },
                    { name: 'Support', value: 'support' },
                )),
    async execute(interaction) {
        var champion = interaction.options.getString('campeón');
        var position = interaction.options.getString('posición');

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

        if (!champ.name) return interaction.followUp({ embeds: [error('El campeón no existe', interaction.user.tag)] });

        var { captureAll } = require('capture-all');
        var { join } = require('path');
        var fs = require('fs');

        var endpoint = `https://app.mobalytics.gg/lol/champions/${champ.key}/build/${position}`;

        var replied = false;
        captureAll([{
            url: endpoint,
            target: '#root > div.m-h6lown > div.m-1mjnfqh > div.m-12se98x > div > div.m-193v1r9 > main > div.m-n6k3jn > div:nth-child(1) > div.m-179t5g5 > div > div > div.m-18nur1e > div.m-2ps0tg > div:nth-child(1) > div:nth-child(1) > div',
            remove: ['#root > div.m-h6lown > div.m-1mjnfqh > div.m-0 > div', '#root > div.m-h6lown > div.m-1mjnfqh > div.m-q4t4x3', '#root > div.m-h6lown > div.m-1mjnfqh > div.m-12se98x > div > div.m-193v1r9 > main > div.m-n6k3jn > div.m-1132e0'],
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
                    .setAuthor({ name: `Runas recomendadas para ${champ.name} - ${lane}`, iconURL: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champ.id}.png` })
                    .setTitle('Esto es lo que he encontrado:')
                    .setImage(`attachment://${filename}`)
                    .setColor('#5d779d')
                    .setFooter({ text: `Solicitado por ${interaction.user.username}`})
                    .setTimestamp();
                await interaction.followUp({ embeds: [embed], files: [attachment] });
                fs.unlinkSync(join(__dirname, filename));
                return replied = true;
            });
        }), setTimeout(() => {
            if (!replied) return interaction.followUp({ embeds: [error('No he podido encontrar las runas de este campeón para la línea que me has pedido.', interaction.user.tag)] });
        }, 15000);
    }
};

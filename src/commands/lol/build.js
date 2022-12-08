const { SlashCommandSubcommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Champion = require('../../util/classes/league/champion');
const error = require('../../util/functions/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('build')
        .setDescription('Shows the build of a champion')
        .setDescriptionLocalizations({
            'es-ES': 'Muestra la build de un campeón',
        })
        .addStringOption(option => option
            .setName('champion').setNameLocalizations({
                'es-ES': 'campeón',
            })
            .setDescription('Champion name').setDescriptionLocalizations({
                'es-ES': 'Nombre del campeón',
            })
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('position').setNameLocalizations({
                'es-ES': 'posición',
            })
            .setDescription('Position of the champion').setDescriptionLocalizations({
                'es-ES': 'Posición del campeón',
            })
            .setRequired(true)
            .addChoices(
                { name: 'Top', value: 'top' },
                { name: 'Jungle', value: 'jungle', name_localizations: { 'es-ES': 'Jungla' } },
                { name: 'Mid', value: 'mid' },
                { name: 'ADC', value: 'adc' },
                { name: 'Support', value: 'support' },
            )
        ),
    async execute(interaction) {
        var champ = await new Champion().get_champion(interaction.options.getString('champion') || interaction.options.getString('campeón'));
        if (!champ) return error(interaction, 'champ-not-found');
    
        var { captureAll } = require('capture-all');
        var { join } = require('path');
        var fs = require('fs');

        var position = interaction.options.getString('position') || interaction.options.getString('posición');
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
                var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.build_command.embed)
                    .replace('{{champion}}', champ.name)
                    .replace('{{lane}}', interaction.locale.lanes[position])
                    .replace('{{champion}}', champ.id)
                    .replace('{{requester}}', interaction.user.tag)
                    .replace('{{requester_icon}}', interaction.user.avatarURL())
                )).setImage(`attachment://${filename}`).setTimestamp();
                await interaction.followUp({ embeds: [embed], files: [attachment] });
                fs.unlinkSync(join(__dirname, filename));
                return replied = true;
            });
        });

        setTimeout(() => replied ? null : error(interaction, 'build-not-found'), 15000);
    }
};

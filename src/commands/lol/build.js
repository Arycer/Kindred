const { SlashCommandSubcommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Champion = require('../../util/classes/league/champion');
const error = require('../../util/functions/error');
const { captureAll } = require('capture-all');
const { join } = require('path');
const fs = require('fs');

async function execute(interaction) {
    var champ = await new Champion().get_champion(interaction.options.getString('champion'));
    if (!champ) return error(interaction, 'champ-not-found');
    var position = interaction.options.getString('lane');

    var endpoint = `https://app.mobalytics.gg/lol/champions/${champ.key}/build/${position}`;
    var replied = false;

    captureAll([{
        url: endpoint,
        target: '#root > div.m-h6lown > div.m-1mjnfqh > div.m-12se98x > div > main > div.m-j50vir > div:nth-child(1) > div.m-179t5g5 > div > div > div.m-18nur1e > div.m-2ps0tg > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)',
        remove: ['#root > div.m-h6lown > div.m-1mjnfqh > div.m-12se98x > div > main > div.m-j50vir > div.m-1132e0', '#root > div.m-h6lown > div.m-1mjnfqh > div.m-q4t4x3'],
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

var data = new SlashCommandSubcommandBuilder()
    .setName('build')
    .setNameLocalizations({
        'es-ES': 'build'
    })
    .setDescription('Shows the most picked build for a champion')
    .setDescriptionLocalizations({
        'es-ES': 'Muestra la build más usada para un campeón'
    })
    .addStringOption(option => {
        return option
            .setName('champion')
            .setNameLocalizations({
                'es-ES': 'campeón'
            })
            .setDescription('Champion name')
            .setDescriptionLocalizations({
                'es-ES': 'Nombre del campeón'
            })
            .setRequired(true);
    })
    .addStringOption(option => {
        return option
            .setName('lane')
            .setNameLocalizations({
                'es-ES': 'línea'
            })
            .setDescription('Lane to search')
            .setDescriptionLocalizations({
                'es-ES': 'Línea a buscar'
            })
            .setRequired(true)
            .addChoices(
                { name: 'Top', value: 'top' },
                { name: 'Jungle', value: 'jungle', name_localizations: { 'es-ES': 'Jungla' } },
                { name: 'Mid', value: 'mid' },
                { name: 'ADC', value: 'adc' },
                { name: 'Support', value: 'support' },
            );
    })

module.exports = { data, execute };
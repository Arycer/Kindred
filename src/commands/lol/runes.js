const { SlashCommandSubcommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Champion = require('../../util/league/classes/champion');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('runes').setNameLocalization('es-ES', 'runas')
        .setDescription('Shows the runes of a champion').setDescriptionLocalization('es-ES', 'Muestra las runas de un campeón')
        .addStringOption(option => option
            .setName('champion').setNameLocalization('es-ES', 'campeón')
            .setDescription('Champion name').setDescriptionLocalization('es-ES', 'Nombre del campeón')
            .setRequired(true))
        .addStringOption(option => option
            .setName('position').setNameLocalization('es-ES', 'posición')
            .setDescription('Position of the champion').setDescriptionLocalization('es-ES', 'Posición del campeón')
            .setRequired(true)
            .addChoices(
                { name: 'Top', value: 'top' },
                { name: 'Jungle', value: 'jungle' },
                { name: 'Mid', value: 'mid' },
                { name: 'ADC', value: 'adc' },
                { name: 'Support', value: 'support' },
            )
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        var champion = interaction.options.getString('champion') || interaction.options.getString('campeón');
        var position = interaction.options.getString('position') || interaction.options.getString('posición');
    
        var champ = await new Champion().get_champion(champion);
    
        if (!champ) {
            var localized_error = locale.error_messages['champ-not-found'];
            var localized_embed = locale.error_embed;
            
            var embed = new EmbedBuilder()
                .setThumbnail(localized_embed.thumbnail)
                .setAuthor(localized_embed.author)
                .setTitle(localized_embed.title)
                .setDescription(localized_error)
                .setColor(localized_embed.color)
                .setFooter({
                    text: localized_embed.footer.text
                        .replace('{{requester}}', interaction.user.tag),
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();
            return await interaction.followUp({ embeds: [embed] });
        }
    
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
                var localized_data = locale.runes_command;
                var embed = new EmbedBuilder()
                    .setAuthor({
                        name: localized_data.embed.author.name
                            .replace('{{champion}}', champ.name)
                            .replace('{{lane}}', locale.lanes[position]),
                        iconURL: localized_data.embed.author.iconURL
                            .replace('{{champion}}', champ.id)
                    })
                    .setTitle(localized_data.embed.title)
                    .setColor(localized_data.embed.color)
                    .setImage(`attachment://${filename}`)
                    .setFooter({
                        text: localized_data.embed.footer.text
                            .replace('{{requester}}', interaction.user.tag),
                        iconURL: interaction.user.avatarURL()
                    })
                    .setTimestamp();
                await interaction.followUp({ embeds: [embed], files: [attachment] });
                replied = true;
                fs.unlinkSync(join(__dirname, filename));
                return;
            });
        });

        setTimeout(() => {
            if (!replied) {
                var localized_error = locale.error_messages['runes-not-found'];
                var localized_embed = locale.error_embed;

                var embed = new EmbedBuilder()
                    .setThumbnail(localized_embed.thumbnail)
                    .setAuthor(localized_embed.author)
                    .setTitle(localized_embed.title)
                    .setDescription(localized_error)
                    .setColor(localized_embed.color)
                    .setFooter({
                        text: localized_embed.footer.text
                            .replace('{{requester}}', interaction.user.tag),
                        iconURL: interaction.user.avatarURL()
                    })
                    .setTimestamp();
                return interaction.followUp({ embeds: [embed] });
            }
        }, 10000);
    }
}
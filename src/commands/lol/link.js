const { SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js');
const Account = require('../../util/league/classes/account');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

var db = new MeowDB({
    dir: './src/database',
    name: 'accounts'
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('link').setNameLocalization('es-ES', 'vincular')
        .setDescription('Links your League of Legends account to your Discord account')
        .setDescriptionLocalization('es-ES', 'Vincula tu cuenta de League of Legends con tu cuenta de Discord')
        .addStringOption(option => option
            .setName('region').setNameLocalization('es-ES', 'región')
            .setDescription('Player region').setDescriptionLocalization('es-ES', 'Región del jugador')
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
        )
        .addStringOption(option => option
            .setName('player').setNameLocalization('es-ES', 'jugador')
            .setDescription('League of Legends username').setDescriptionLocalization('es-ES', 'Nombre de usuario de League of Legends')
            .setRequired(true)
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        var username = interaction.options.getString('jugador') || interaction.options.getString('player');
        var region = interaction.options.getString('region') || interaction.options.getString('región');
        
        var account = new Account(); account.region.get_region(region);
        await account.summoner.get_summoner(account.region, username);
    
        if (!account.summoner.identifiers.s_id) {
            var localized_error = locale.error_messages['profile-not-found'];
            var localized_embed = locale.error_embed;
            var embed = new EmbedBuilder()
                .setThumbnail(localized_embed.thumbnail)
                .setAuthor(localized_embed.author)
                .setTitle(localized_embed.title)
                .setDescription(localized_error)
                .setColor(localized_embed.color)
                .setFooter({ text: localized_embed.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
                .setTimestamp();
            return interaction.followUp({ embeds: [embed] });
        }
    
        do {
            var random = Math.floor(Math.random() * 21);
        } while (account.summoner.icon.id == random);
    
        var requiered_icon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${random}.jpg`;
        var old_icon = account.summoner.icon.url;
        
        var localized_data = locale.link_command;
        var instructions = localized_data.instructions_embed;

        var embed = new EmbedBuilder()
            .setAuthor({
                name: instructions.author.name
                    .replace('{{region}}', account.region.name)
                    .replace('{{name}}', account.summoner.name),
                iconURL: account.summoner.icon.url
            })
            .setTitle(instructions.title)
            .setDescription(instructions.description)
            .setThumbnail(requiered_icon)
            .setColor(instructions.color)
            .setFooter({ text: instructions.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
            .setTimestamp();

        var row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel(localized_data.button)
                    .setStyle(ButtonStyle.Primary)
            );

        var message = await interaction.channel.send({ embeds: [embed], components: [row] });

        var collector = new InteractionCollector(interaction.client, {
            time: 5 * 60 * 1000,
            max: 1,
            filter: i => i.customId === 'verify' && i.user.id === interaction.user.id
        })
            
        collector.on('collect', async () => {
            var summoner = await account.summoner.get_summoner(account.region, username);

            if (summoner.icon.id == random) {
                account.discord_id = interaction.user.id;
                account.summoner = summoner;

                if (db.get(account.discord_id)) db.delete(account.discord_id);
                db.create(account.discord_id, account);

                var success = localized_data.success_embed;

                var embed = new EmbedBuilder()
                    .setAuthor({
                        name: success.author.name
                            .replace('{{region}}', account.region.name)
                            .replace('{{name}}', account.summoner.name),
                        iconURL: old_icon
                    })
                    .setTitle(success.title)
                    .setDescription(success.description)
                    .setThumbnail(success.thumbnail)
                    .setColor(success.color)
                    .setFooter({ text: success.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
                    .setTimestamp();

                await interaction.followUp({ embeds: [embed], components: [] });
                await message.delete();
            } else {
                var error = locale.error_embed;
                var embed = new EmbedBuilder()
                    .setThumbnail(error.thumbnail)
                    .setAuthor(error.author)
                    .setTitle(error.title)
                    .setDescription(locale.error_messages['link-failed'])
                    .setColor(error.color)
                    .setFooter({ text: error.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
                    .setTimestamp();

                await interaction.followUp({ embeds: [embed], components: [] });
                await message.delete();
            }
        });

        collector.on('end', async (collected) => {
            if (collected.size > 0) return;
            var error = locale.error_embed;
            var embed = new EmbedBuilder()
                .setThumbnail(error.thumbnail)
                .setAuthor(error.author)
                .setTitle(error.title)
                .setDescription(locale.error_messages['link-timeout'])
                .setColor(error.color)
                .setFooter({ text: error.footer.text.replace('{{requester}}', interaction.user.tag), iconURL: interaction.user.avatarURL() })
                .setTimestamp();

            await interaction.followUp({ embeds: [embed], components: [] });
            await message.delete();
        });
    }
}
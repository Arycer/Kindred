const { SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js');
const Account = require('../../util/league/classes/account');
const error = require('../../util/error');
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
        .setName('link')
        .setDescription('Links your League of Legends account to your Discord account')
        .setDescriptionLocalizations({
            'es-ES': 'Vincula tu cuenta de League of Legends con tu cuenta de Discord',
        })
        .addStringOption(option => option
            .setName('region').setNameLocalization('es-ES', 'región')
            .setDescription('Player region').setDescriptionLocalizations({
                'es-ES': 'Región del jugador',
            })
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
            .setDescription('League of Legends username').setDescriptionLocalizations({
                'es-ES': 'Nombre de usuario de League of Legends',
            })
            .setRequired(true)
        ),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        var username = interaction.options.getString('jugador') || interaction.options.getString('player');
        var region = interaction.options.getString('region') || interaction.options.getString('región');
        
        var account = new Account(); account.region.get_region(region);
        await account.summoner.get_summoner(account.region, username);    
        if (!account.summoner.identifiers.s_id) return error(interaction, locale, 'profile_not_found');
    
        do {
            var random = Math.floor(Math.random() * 21);
        } while (account.summoner.icon.id == random);
    
        var requiered_icon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${random}.jpg`;
        var old_icon = account.summoner.icon.url;

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.link_command.instructions_embed)
            .replace('{{region}}', account.region.name)
            .replace('{{name}}', account.summoner.name)
            .replace('{{iconURL}}', account.summoner.icon.url)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setThumbnail(requiered_icon).setTimestamp();

        var row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel(locale.link_command.button)
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
            if (summoner.icon.id != random) {
                error(interaction, locale, 'link-failed');
                return await message.delete();
            }
            account.discord_id = interaction.user.id;
            account.summoner = summoner;

            if (db.get(account.discord_id)) db.delete(account.discord_id);
            db.create(account.discord_id, account);

            var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.link_command.success_embed)
                .replace('{{region}}', account.region.name)
                .replace('{{name}}', account.summoner.name)
                .replace('{{iconURL}}', old_icon)
                .replace('{{requester}}', interaction.user.tag)
                .replace('{{requester_icon}}', interaction.user.avatarURL())
            )).setTimestamp();
            await interaction.followUp({ embeds: [embed] });
            await message.delete();
        });

        collector.on('end', async (collected) => {
            if (collected.size == 0) {
                error(interaction, locale, 'link-timeout');
                return await message.delete();
            }
        });
    }
}